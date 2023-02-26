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
  const perPage = parseInt(searchParams.get('limit') || '0') || 20
  const displayCategoryIds = searchParams.get('categories')?.split('-').map(Number) || []

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)

    if (response.ok) {
      const data = (await response.json()) as ProductsResponse

      if (data.success) {
        const { data: productsData } = data
        const filteredProducts =
          displayCategoryIds.length > 0
            ? productsData.filter(product =>
                product.displayCategories.some(category => displayCategoryIds.includes(category))
              )
            : productsData
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
                    }&per-page=${perPage}${
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
                    }&per-page=${perPage}${
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
          { status: 200 }
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
