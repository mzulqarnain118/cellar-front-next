import Fuse from 'fuse.js'
import { NextApiRequest, NextApiResponse } from 'next'

import { ProductsSchema } from '@/lib/types/schemas/product'

export type FuseSearchResult = Fuse.FuseResult<ProductsSchema>

const options: Fuse.IFuseOptions<ProductsSchema> = {
  findAllMatches: true,
  includeMatches: true,
  includeScore: true,
  keys: ['displayName', 'sku', 'cartUrl'],
  useExtendedSearch: false,
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      res
        .appendHeader('Allow', 'GET')
        .status(405)
        .json({
          error: {
            message: `Method "${req.method}" is not allowed.`,
          },
          success: false,
        })
      return
    }
    const { query: search } = req
    const q = search.q?.toString()

    const page = parseInt(search.page?.toString() || '0') || 1
    const perPage = parseInt(search.limit?.toString() || '0') || 16
    const displayCategoryIds = search.categories?.toString().split(',').map(Number) || [1]
    const sort: 'relevant' | 'price-low-high' | 'price-high-low' =
      (search.sort?.toString() as 'relevant' | 'price-low-high' | 'price-high-low') || 'relevant'
    const provinceId = parseInt(search.provinceId?.toString() || '48')

    if (!q) {
      res.status(400).json({
        message: "A query param called 'q' containing the search query is required.",
        success: false,
      })
      return
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)

    if (response.ok) {
      const data = (await response.json()) as {
        data: ProductsSchema[]
        success: boolean
      }

      if (data.success) {
        const { data: productsData } = data
        let products = productsData
        products = products.filter(product => product.displayCategories.includes(1))
        const fuse = new Fuse(products, options)
        const result = fuse.search(q?.toString() || '')
        const searchResults = result.map(result => result.item)
        let filteredProducts =
          displayCategoryIds.length > 0
            ? searchResults.filter(product =>
                displayCategoryIds.every(category => product.displayCategories.includes(category))
              )
            : searchResults

        filteredProducts = filteredProducts.filter(product =>
          product.availability?.some(state => state.enabled && state.provinceId === provinceId)
        )
        const indexOfLastRecord = page * perPage
        const indexOfFirstRecord = indexOfLastRecord - perPage
        const slicedProducts = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord)
        const totalNumberOfPages = Math.ceil(filteredProducts.length / perPage)

        if (result === undefined) {
          res
            .setHeader('Cache-Control', 's-maxage-1200, stale-while-revalidate-600')
            .setHeader('Content-Type', 'application/json')
            .status(204)
            .json({
              data: [],
              success: true,
            })
          return
        } else {
          res
            .setHeader('Cache-Control', 's-maxage-1200, stale-while-revalidate-600')
            .setHeader('Content-Type', 'application/json')
            .status(200)
            .json({
              data: {
                nextPageUrl:
                  page + 1 > totalNumberOfPages
                    ? undefined
                    : `${process.env.NEXT_PUBLIC_APP_URL}/api/search?q=${q.toString()}&page=${
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
                    : `${process.env.NEXT_PUBLIC_APP_URL}/api/search?q=${q.toString()}&page=${
                        page - 1
                      }&sort=${sort}&limit=${perPage}${
                        displayCategoryIds.length > 0
                          ? `&categories=${displayCategoryIds.join('-')}`
                          : ''
                      }`,
                products: slicedProducts,
                results: filteredProducts.length,
                resultsShown: [
                  page <= 1 ? 1 : perPage * (page - 1) + 1,
                  page === totalNumberOfPages ? filteredProducts.length : page * perPage,
                ],
                totalNumberOfPages,
              },
              success: true,
            })
          return
        }
      }

      res.status(500).json({
        error: {
          message: `There was an error fetching a search result for query: ${q}.`,
        },
        success: false,
      })
      return
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
