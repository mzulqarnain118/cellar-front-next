import { NextRequest } from 'next/server'

import Fuse from 'fuse.js'

import { ProductsResponse, ProductsSchema } from '@/lib/types/schemas/product'

export const config = {
  runtime: 'edge',
}

export type FuseSearchResult = Fuse.FuseResult<ProductsSchema>

const options: Fuse.IFuseOptions<ProductsSchema> = {
  includeScore: true,
  keys: ['displayName', 'sku'],
  minMatchCharLength: 2,
  useExtendedSearch: true,
}

const handler = async (req: NextRequest) => {
  try {
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
    const { search, searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q) {
      return new Response(
        JSON.stringify({
          message: "A query param called 'q' containing the search query is required.",
          success: false,
        }),
        {
          status: 400, // * Bad data.
        }
      )
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products${search}`)

    if (response.ok) {
      const data = (await response.json()) as ProductsResponse

      if (data.success) {
        const { data: productsData } = data
        const products = productsData
        const fuse = new Fuse(products, options)
        const result = fuse.search(q.toString())

        if (result === undefined) {
          return new Response(
            JSON.stringify({
              data: [],
              success: true,
            }),
            {
              headers: {
                'Cache-Control': 's-maxage=1200, stale-while-revalidate=600',
                'Content-Type': 'application/json',
              },
              status: 204, // * No content.
            }
          )
        } else {
          return new Response(
            JSON.stringify({
              data: result.map(product => ({ ...product, score: product.score || 0 })),
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
      }

      return new Response(
        JSON.stringify({
          error: { message: `There was an error fetching a search result for query: ${q}.` },
          success: false,
        })
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: 'There was an error fetching a search result for query',
        },
        success: false,
      }),
      { status: 500 }
    )
  }
}

export default handler
