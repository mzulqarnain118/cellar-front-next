import type { NextRequest } from 'next/server'

import { Filter } from '@/lib/stores/filters'
import { ProductsResponse } from '@/lib/types/schemas/product'

export const config = {
  runtime: 'edge',
}

const handler = async (req: NextRequest) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: {
          message: `Method "${req.method}" is not allowed.`,
        },
        success: false,
      }),
      {
        headers: {
          Allow: 'GET, POST',
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
                displayCategoryIds.some(category => product.displayCategories.includes(category))
              )
            : productsData

        if (req.method === 'POST') {
          const activeFilters = (await req.json()) as Filter[]

          if (activeFilters.length > 0) {
            filteredProducts = filteredProducts.filter(product =>
              activeFilters.every(filter => {
                switch (filter.type) {
                  case 'brand':
                    return (
                      !!product.attributes?.Brand &&
                      product.attributes.Brand.toLowerCase() === filter.name.toLowerCase()
                    )
                  case 'custom':
                    return filter.displayCategoryIds?.some(category =>
                      product.displayCategories.includes(category)
                    )
                  case 'pairing-note':
                    return (
                      !!product.attributes?.['Pairing Notes'] &&
                      product.attributes['Pairing Notes'].length > 0 &&
                      product.attributes['Pairing Notes'].find(
                        note => note.name.toLowerCase() === filter.name.toLowerCase()
                      )
                    )
                  // ! TODO Price
                  case 'price':
                    if (filter.value !== undefined) {
                      if (filter.value[0] === 0 && filter.value[1] === 20) {
                        return product.price <= 25
                      } else if (filter.value[0] === 0 && filter.value[1] === 40) {
                        return product.price <= 50
                      } else if (filter.value[0] === 0 && filter.value[1] === 60) {
                        return product.price <= 75
                      } else if (filter.value[0] === 0 && filter.value[1] === 80) {
                        return product.price <= 100
                      } else if (filter.value[0] === 0 && filter.value[1] === 100) {
                        return product.price >= 0
                      } else if (filter.value[0] === 20 && filter.value[1] === 40) {
                        return product.price >= 25 && product.price <= 50
                      } else if (filter.value[0] === 20 && filter.value[1] === 60) {
                        return product.price >= 25 && product.price <= 75
                      } else if (filter.value[0] === 20 && filter.value[1] === 80) {
                        return product.price >= 25 && product.price <= 100
                      } else if (filter.value[0] === 20 && filter.value[1] === 100) {
                        return product.price >= 0
                      } else if (filter.value[0] === 40 && filter.value[1] === 60) {
                        return product.price >= 50 && product.price <= 75
                      } else if (filter.value[0] === 40 && filter.value[1] === 80) {
                        return product.price >= 50 && product.price <= 100
                      } else if (filter.value[0] === 40 && filter.value[1] === 100) {
                        return product.price >= 50
                      } else if (filter.value[0] === 60 && filter.value[1] === 80) {
                        return product.price >= 75 && product.price <= 100
                      } else if (filter.value[0] === 60 && filter.value[1] === 100) {
                        return product.price >= 75
                      } else if (filter.value[0] === 80 && filter.value[1] === 100) {
                        return product.price >= 100
                      }
                    }
                    return false
                  case 'country':
                    return (
                      !!product.attributes?.Origin &&
                      product.attributes.Origin.toLowerCase() === filter.name.toLowerCase()
                    )
                  case 'tasting-note':
                    return (
                      !!product.attributes?.['Tasting Notes'] &&
                      product.attributes['Tasting Notes'].length > 0 &&
                      product.attributes['Tasting Notes'].find(
                        note => note.name.toLowerCase() === filter.name.toLowerCase()
                      )
                    )
                  case 'varietal':
                    return (
                      !!product.attributes?.Varietal &&
                      product.attributes.Varietal.toLowerCase() === filter.name.toLowerCase()
                    )
                  default:
                    return false
                }
              })
            )
          }
        }
        console.log('🚀 ~ handler ~ filteredProducts:', filteredProducts)

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
