import { QueryFunction, useQuery } from '@tanstack/react-query'

import {
  PaginatedProductsResponse,
  PaginatedProductsSchema,
  ProductsResponse,
  ProductsSchema,
} from '../types/schemas/product'

export const PRODUCTS_QUERY_KEY = ['products']

export const getAllProducts: QueryFunction<ProductsSchema[] | undefined> = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)
  const result = (await response.json()) as ProductsResponse

  if (result.success) {
    return result.data
  }
}

export const getProductByCartUrl: QueryFunction<ProductsSchema | undefined> = async ({
  queryKey,
}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/${queryKey[1]}`)
  const result = (await response.json()) as { data: ProductsSchema; success: boolean }

  if (result.success) {
    return result.data
  }
}

export const getPaginatedProducts: QueryFunction<
  PaginatedProductsSchema | undefined,
  string[]
> = async ({ queryKey }) => {
  const data = JSON.parse(queryKey[1])
  const params = new URLSearchParams(data).toString()
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products${params ? `?${params}` : ''}`
  )

  const result = (await response.json()) as PaginatedProductsResponse

  if (result.success) {
    return result.data
  }
}

export const useProductsQuery = () =>
  useQuery({
    // cacheTime: 20 * (60 * 1000), // 20 minutes.
    queryFn: getAllProducts,
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

export const PAGINATED_PRODUCTS_QUERY_KEY = ['paginated-products']
export const usePaginatedProducts = (data: {
  categories?: number[]
  limit?: number
  page: number
}) =>
  useQuery({
    keepPreviousData: true,
    queryFn: getPaginatedProducts,
    queryKey: [...PAGINATED_PRODUCTS_QUERY_KEY, JSON.stringify(data)],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
