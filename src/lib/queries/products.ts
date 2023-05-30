import { QueryFunction, useQuery } from '@tanstack/react-query'

import { localApi } from '../api'
import { useUserShippingState } from '../stores/user'
import {
  PaginatedProductsResponse,
  PaginatedProductsSchema,
  ProductsResponse,
  ProductsSchema,
} from '../types/schemas/product'

export const PRODUCTS_QUERY_KEY = ['products']

interface Data {
  categories: number[]
  limit?: number
  page: number
  provinceId?: number
  sort: 'relevant' | 'price-low-high' | 'price-high-low'
}

export const getAllProducts: QueryFunction<ProductsSchema[] | undefined> = async () => {
  try {
    const response = await localApi('products/all')
    const result = (await response.json()) as ProductsResponse

    if (result.success) {
      return result.data
    }
  } catch {
    //
  }
}

export const getProductByCartUrl: QueryFunction<ProductsSchema | undefined> = async ({
  queryKey,
}) => {
  try {
    const response = await localApi(`products/${queryKey[1]}`)
    const result = (await response.json()) as { data: ProductsSchema; success: boolean }

    if (result.success) {
      return result.data
    }
  } catch {
    //
  }
}

export const getPaginatedProducts: QueryFunction<
  PaginatedProductsSchema | undefined,
  (string | number | Data | Record<string, string>)[]
> = async ({ queryKey }) => {
  const data = queryKey[1] as Record<string, string>

  if (data.categories) {
    data.categories = data.categories.toString()
  }

  const params = new URLSearchParams(data).toString()
  const response = await localApi(`products${params ? `?${params}` : ''}`)

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
export const usePaginatedProducts = (data: Data) => {
  const { provinceID } = useUserShippingState()

  return useQuery({
    keepPreviousData: true,
    queryFn: getPaginatedProducts,
    queryKey: [...PAGINATED_PRODUCTS_QUERY_KEY, { ...data, provinceID }],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useInfiniteProducts = (data: { categories?: number[]; page: number }) =>
  useQuery({
    getNextPageParam: lastPage => {
      if (lastPage !== undefined) {
        const nextPage = lastPage.page + 1
        if (lastPage.totalNumberOfPages <= nextPage) {
          return JSON.stringify({
            categories: data.categories,
            page: lastPage.page + 1,
          })
        }
      }
    },
    keepPreviousData: true,
    queryFn: getPaginatedProducts,
    queryKey: [...PAGINATED_PRODUCTS_QUERY_KEY, JSON.stringify(data)],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
