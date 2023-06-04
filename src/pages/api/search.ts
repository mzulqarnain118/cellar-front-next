import Fuse from 'fuse.js'
import { NextApiRequest, NextApiResponse } from 'next'

import { ProductsResponse, ProductsSchema } from '@/lib/types/schemas/product'

export type FuseSearchResult = Fuse.FuseResult<ProductsSchema>

const options: Fuse.IFuseOptions<ProductsSchema> = {
  findAllMatches: true,
  includeMatches: true,
  includeScore: true,
  keys: ['displayName'],
  useExtendedSearch: false,
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      res
        .status(405)
        .appendHeader('Allow', 'GET')
        .json({
          error: {
            message: `Method "${req.method}" is not allowed.`,
          },
          success: false,
        })
    }
    const { query: search } = req
    const q = search.q?.toString()

    if (!q) {
      res.status(400).json({
        message: "A query param called 'q' containing the search query is required.",
        success: false,
      })
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${search?.toString()}`
    )

    if (response.ok) {
      const data = (await response.json()) as ProductsResponse

      if (data.success) {
        const { data: productsData } = data
        const products = productsData
        const fuse = new Fuse(products, options)
        const result = fuse.search(q?.toString() || '')

        if (result === undefined) {
          res
            .status(204)
            .setHeader('Cache-Control', 's-maxage-1200, stale-while-revalidate-600')
            .setHeader('Content-Type', 'application/json')
            .json({
              data: [],
              success: true,
            })
        } else {
          res
            .status(200)
            .setHeader('Cache-Control', 's-maxage-1200, stale-while-revalidate-600')
            .setHeader('Content-Type', 'application/json')
            .json({
              data: result.map(product => ({ ...product, score: product.score || 0 })),
              success: true,
            })
        }
      }

      res.status(500).json({
        error: { message: `There was an error fetching a search result for query: ${q}.` },
        success: false,
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Something went wrong',
      success: false,
    })
  }
}

export default handler
