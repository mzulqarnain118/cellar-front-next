import { QueryFunction, useQuery } from '@tanstack/react-query'

import { ProductResponse, ProductsResponse } from '../types/schemas/product'

export const PRODUCTS_QUERY_KEY = ['products']

export const getProducts: QueryFunction<ProductsResponse> = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`)
  return await response.json()
}

export const getProductByCartUrl: QueryFunction<ProductResponse> = async ({ queryKey }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${queryKey[1]}`)
  return await response.json()
}

export const useProductsQuery = () =>
  useQuery({
    // cacheTime: 20 * (60 * 1000), // 20 minutes.
    queryFn: getProducts,
    queryKey: PRODUCTS_QUERY_KEY,
    // staleTime: 10 * (60 * 1000), // 10 minutes.
  })

export const useProductQuery = (cartUrl: string) =>
  useQuery({
    // cacheTime: 20 * (60 * 1000), // 20 minutes.
    queryFn: getProductByCartUrl,
    queryKey: [...PRODUCTS_QUERY_KEY, cartUrl],
    // staleTime: 10 * (60 * 1000), // 10 minutes.
  })
