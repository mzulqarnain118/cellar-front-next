import { QueryClient, useQuery } from '@tanstack/react-query'

import { camelizePascalKeys } from '@/core/utils'

import { api } from '../api'
import { Product, ProductAttribute } from '../types'

export const PRODUCTS_QUERY_KEY = ['products']
export const PRODUCT_FILTERS_QUERY_KEY = ['products', 'filters']

export const getWineProducts = async () =>
  camelizePascalKeys((await api('shop/products').json<{ data: Product[] }>()).data) as Product[]

export const useProductsQuery = () => useQuery(PRODUCTS_QUERY_KEY, getWineProducts)

export const getProductFilters = async (name: string) => {
  const queryClient = new QueryClient()
  const products = await queryClient.fetchQuery(PRODUCTS_QUERY_KEY, getWineProducts)
  const attributes = products
    .flatMap(product => product.attributes)
    .filter(
      (attribute): attribute is { name: ProductAttribute; value: string } =>
        attribute !== null && 'value' in attribute
    )
    .filter(attribute => attribute.name.toLowerCase() === name.toLowerCase())

  return attributes !== undefined
    ? Array.from(
        new Set([
          ...attributes.filter(attribute => attribute?.name === name).map(att => att?.value),
        ])
      )
    : null
}

export const useProductFilter = (name: string) =>
  useQuery([...PRODUCTS_QUERY_KEY, name], () => getProductFilters(name), {
    refetchOnWindowFocus: false,
  })
