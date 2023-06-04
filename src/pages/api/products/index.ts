import type { NextRequest } from 'next/server'

import { ProductsResponse } from '@/lib/types/schemas/product'

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

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0') || 1
  const perPage = parseInt(searchParams.get('limit') || '0') || 16
  const displayCategoryIds = searchParams.get('categories')?.split(',').map(Number) || [1]
  const sort: 'relevant' | 'price-low-high' | 'price-high-low' =
    (searchParams.get('sort') as 'relevant' | 'price-low-high' | 'price-high-low') || 'relevant'
  const provinceId = parseInt(searchParams.get('provinceId') || '48')

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)

    if (response.ok) {
      const data = (await response.json()) as ProductsResponse

      if (data.success) {
        const { data: productsData } = data
        let filteredProducts =
          displayCategoryIds.length > 0
            ? productsData.filter(product =>
                displayCategoryIds.every(category => product.displayCategories.includes(category))
              )
            : productsData
        filteredProducts = filteredProducts
          .sort((left, right) => {
            const leftPrice = left.onSalePrice !== undefined ? left.onSalePrice : left.price || 0
            const rightPrice =
              right.onSalePrice !== undefined ? right.onSalePrice : right.price || 0

            if (sort === 'price-high-low') {
              return rightPrice - leftPrice
            } else if (sort === 'price-low-high') {
              return leftPrice - rightPrice
            }

            const leftCategoryId = left.displayCategoriesSortData?.[0]?.id || undefined
            const rightCategoryId = right.displayCategoriesSortData?.[0]?.id || undefined
            const leftDisplayOrder = left.displayCategoriesSortData?.[0]?.order || 100000
            const rightDisplayOrder = right.displayCategoriesSortData?.[0]?.order || 100000

            if (leftCategoryId && rightCategoryId && leftCategoryId - rightCategoryId > 0) {
              return 1
            } else if (leftCategoryId && rightCategoryId && leftCategoryId - rightCategoryId < 0) {
              return -1
            } else if (leftDisplayOrder - rightDisplayOrder > 0) {
              return 1
            } else if (leftDisplayOrder - rightDisplayOrder < 0) {
              return -1
            } else if (leftPrice - rightPrice > 0) {
              return 1
            }

            return -1
          })
          .filter(product =>
            product.availability?.some(state => state.enabled && state.provinceId === provinceId)
          )
        const indexOfLastRecord = page * perPage
        const indexOfFirstRecord = indexOfLastRecord - perPage
        const products = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord)
        const totalNumberOfPages = Math.ceil(filteredProducts.length / perPage)

        return new Response(
          JSON.stringify({
            data: {
              nextPageUrl:
                page + 1 > totalNumberOfPages
                  ? undefined
                  : `${process.env.NEXT_PUBLIC_APP_URL}/api/products?page=${
                      page + 1
                    }&sort=${sort}&limit=${perPage}${
                      displayCategoryIds.length > 0
                        ? `&categories=${displayCategoryIds.join('-')}`
                        : ''
                    }`,
              page,
              perPage,
              previousPageUrl:
                page <= 1
                  ? undefined
                  : `${process.env.NEXT_PUBLIC_APP_URL}/api/products?page=${
                      page - 1
                    }&sort=${sort}&limit=${perPage}${
                      displayCategoryIds.length > 0
                        ? `&categories=${displayCategoryIds.join('-')}`
                        : ''
                    }`,
              products,
              results: filteredProducts.length,
              resultsShown: [
                page <= 1 ? 1 : perPage * (page - 1) + 1,
                page === totalNumberOfPages ? filteredProducts.length : page * perPage,
              ],
              totalNumberOfPages,
            },
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
      // ! TODO
      return new Response(
        JSON.stringify({
          error: {
            message: 'There was an error fetching products.',
          },
          success: false,
        })
      )
    }
    // ! TODO
    return new Response(
      JSON.stringify({
        error: {
          message: 'There was an error fetching products.',
        },
        success: false,
      })
    )
  } catch {
    // ! TODO
    return new Response(
      JSON.stringify({
        error: {
          message: 'There was an error fetching products.',
        },
        success: false,
      })
    )
  }
}

export default handler
