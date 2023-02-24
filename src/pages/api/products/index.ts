import type { NextRequest } from 'next/server'

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
        comparePrice: string | null
        DisplayCategories: { displayCategoryID: number; displayOrder: number }[] | null
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
      const { searchParams } = new URL(req.url)
      const cartUrl = searchParams.get('cartUrl')

      const data = productsResponse.data.map(product => ({
        attributes:
          (!!product.attributes &&
            product.attributes?.map(attribute => ({
              name: attribute.Name,
              value: attribute.Value,
            }))) ||
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
        cartUrl: product.cartUrl || undefined,
        catalogId: product.CatalogID,
        displayCategories:
          (!!product.DisplayCategories &&
            product.DisplayCategories?.map(category => ({
              id: category.displayCategoryID,
              order: category.displayOrder,
            }))) ||
          undefined,
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
          data: cartUrl ? data.find(product => product.cartUrl === cartUrl) : data,
          success: true,
        }),
        {
          headers: {
            'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }
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
