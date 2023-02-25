import type { NextRequest } from 'next/server'

import { ProductsSchema } from '@/lib/types/schemas/product'

export const config = {
  runtime: 'edge',
}

const handler = async (req: NextRequest) => {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: {
          message: `Method "${req.method}" is not allowed.`,
        },
        success: false,
      }),
      {
        headers: {
          Allow: 'GET',
        },
        status: 405, // * Method not allowed.
      }
    )
  }

  try {
    const productsResponse = (await (
      await fetch(`${process.env.NEXT_PUBLIC_TOWER_API_URL}/api/shop/products`)
    ).json()) as {
      data: {
        attributes: { Name: string; Value: string }[] | null
        Availability: { Abbr: string; Enabled: boolean; Name: string; ProvinceID: number }[] | null
        badges: { ImageURL: string; Name: string }[] | null
        cartUrl: string | null
        CatalogID: number
        CategoriesIDs: number[] | null
        comparePrice: string | null
        displayCategories: { displayCategoryID: number; displayOrder: number }[] | null
        displayName: string
        pictureUrl: string | null
        price: number
        quantityAvailable: number
        sku: string
        subscribable: boolean
        variations:
          | {
              Active: boolean
              Primary: boolean
              SKU: string
              ProductVariations:
                | { VariationTypeOptionName: string; VariationTypeName: string }[]
                | null
            }[]
          | null
      }[]
      result: boolean
    }

    if (productsResponse.result) {
      const data: ProductsSchema[] = productsResponse.data
        .filter(product => !!product.cartUrl && product.cartUrl !== null)
        .map(product => ({
          attributes:
            (!!product.attributes &&
              product.attributes?.reduce<{ [name: string]: string }>((map, attribute) => {
                map[attribute.Name] = attribute.Value
                return map
              }, {})) ||
            undefined,
          availability:
            (!!product.Availability &&
              product.Availability?.map(state => ({
                abbreviation: state.Abbr,
                enabled: state.Enabled,
                name: state.Name,
                provinceId: state.ProvinceID,
              }))) ||
            undefined,
          badges:
            (!!product.badges?.length &&
              product.badges?.map(badge => ({ imageUrl: badge.ImageURL, name: badge.Name }))) ||
            undefined,
          cartUrl: product.cartUrl || '',
          catalogId: product.CatalogID,
          // displayCategories:
          //   (!!product.displayCategories &&
          //     product.displayCategories?.map(category => ({
          //       id: category.displayCategoryID,
          //       order: category.displayOrder,
          //     }))) ||
          //   undefined,
          displayCategories: product.CategoriesIDs || [],
          displayName: product.displayName,
          onSalePrice: product.comparePrice
            ? parseFloat(product.comparePrice || '0') || undefined
            : undefined,
          pictureUrl: product.pictureUrl || undefined,
          price: product.price,
          quantityAvailable: product.quantityAvailable || 0,
          sku: product.sku,
          subscribable: product.subscribable || false,
          variations:
            (!!product.variations?.length &&
              product.variations?.map(variation => ({
                active: variation.Active,
                primary: variation.Primary,
                sku: variation.SKU,
                variations:
                  variation.ProductVariations?.map(pVar => ({
                    option: pVar.VariationTypeOptionName,
                    type: pVar.VariationTypeName,
                  })) || undefined,
              }))) ||
            undefined,
        }))

      return new Response(
        JSON.stringify({
          data,
          success: true,
        }),
        {
          headers: {
            'Cache-Control': 's-maxage=1200, stale-while-revalidate=600',
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }
    // ! TODO: Log into Sentry.
    return new Response(
      JSON.stringify({
        error: { message: 'There was an error fetching the products.' },
        success: false,
      }),
      { status: 500 }
    )
  } catch {
    // ! TODO: Log into Sentry.
    return new Response(
      JSON.stringify({
        error: { message: 'There was an error fetching the products.' },
        success: false,
      }),
      { status: 500 }
    )
  }
}

export default handler
