import { QueryClient, useQuery } from '@tanstack/react-query'

import { camelizePascalKeys } from '@/core/utils'

import { api } from '../api'
import { Product, ProductAttribute } from '../types'

export const PRODUCTS_QUERY_KEY = ['products']

export const getProducts = async (categoryDisplayCategoryId?: number) => {
  const data = camelizePascalKeys(
    (await api('shop/products').json<{ data: Product[] }>()).data
  ) as Product[]
  return categoryDisplayCategoryId !== undefined
    ? data.filter(
        item =>
          !!categoryDisplayCategoryId &&
          item.categoriesIDs?.includes(categoryDisplayCategoryId) &&
          item.catalogID === 1 &&
          item.quantityAvailable &&
          item.quantityAvailable > 20
      )
    : data
}

interface PaginatedProductsOptions {
  categoryDisplayCategoryId: number
  page: number
  limit: number
}

export const getProductsByPage = async ({
  categoryDisplayCategoryId,
  limit,
  page,
}: PaginatedProductsOptions) => {
  const data = await api('v2/shop/new/products', {
    method: 'get',
    searchParams: { limit, page },
  }).json<{
    Success: boolean
    Data: {
      NextPageUrl: string
      Page: number
      PreviousPageUrl: string
      TotalNumberOfPages: number
      TotalNumberOfProducts: number
      Products: Product[]
    }
  }>()

  return camelizePascalKeys<{
    totalNumberOfPages: number
    totalNumberOfProducts: number
    products: Product[]
  }>(data?.Data)
}

export const usePaginatedProductsQuery = ({
  categoryDisplayCategoryId,
  limit,
  page,
}: PaginatedProductsOptions) =>
  useQuery({
    queryFn: () => getProductsByPage({ categoryDisplayCategoryId, limit, page }),
    queryKey: ['products', categoryDisplayCategoryId, limit, page],
  })

export const useProductsQuery = (categoryDisplayCategoryId: number, enabled = true) =>
  useQuery({
    enabled,
    keepPreviousData: true,
    queryFn: () => getProducts(categoryDisplayCategoryId),
    queryKey: [...PRODUCTS_QUERY_KEY, categoryDisplayCategoryId],
  })

export const getProductFilters = async (name: string) => {
  const queryClient = new QueryClient()
  const products = await queryClient.fetchQuery(PRODUCTS_QUERY_KEY, () => getProducts(0))
  const attributes = products
    .flatMap(product => product.attributes)
    .filter(
      (attribute): attribute is { name: ProductAttribute; value: string } =>
        attribute !== null && 'value' in attribute
    )
    .filter(attribute => attribute.name.toLowerCase() === name.toLowerCase())

  const filters = attributes
    .filter(attribute => attribute?.name === name)
    .map(att => att?.value)
    .flatMap(value =>
      value.split('|').map(word => word.slice(0, 1).toUpperCase() + word.slice(1, word.length))
    )
  // * NOTE: Remove duplicates.
  return filters.filter((element, index) => filters.indexOf(element) === index)
}

export const useProductFilter = (name: string) =>
  useQuery([...PRODUCTS_QUERY_KEY, 'filter', name], () => getProductFilters(name), {
    refetchOnWindowFocus: false,
  })
