import { QueryFunction, useQuery } from '@tanstack/react-query'

import { localApi } from '../api'
import { Filter, useFiltersStore } from '../stores/filters'
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
  search?: string
  sort: 'relevant' | 'price-low-high' | 'price-high-low'
}

export const getAllProducts: QueryFunction<ProductsSchema[] | null> = async () => {
  try {
    const response = await localApi('products/all')
    const result = (await response.json()) as ProductsResponse

    if (result.success) {
      return result.data
    }
    return null
  } catch {
    return null
  }
}

export const getProductByCartUrl: QueryFunction<ProductsSchema | null> = async ({ queryKey }) => {
  try {
    const response = await localApi(`products/${queryKey[1]}`)
    const result = (await response.json()) as { data: ProductsSchema; success: boolean }

    if (result.success) {
      return result.data
    }
    return null
  } catch {
    return null
  }
}

export const getPaginatedProducts: QueryFunction<
  PaginatedProductsSchema | null,
  (string | number | Data | Filter[] | Record<string, string>)[]
> = async ({ queryKey }) => {
  const data = queryKey[1] as Record<string, string>
  const filters = queryKey[2] as Filter[]

  if (data.categories) {
    data.categories = data.categories.toString()
  }

  if (data.search) {
    data.categories = [1].toString()
    data.q = data.search
    delete data.search
  }

  const params = new URLSearchParams(data).toString()
  const response = await localApi(`products${params ? `?${params}` : ''}`, {
    json: !!filters && filters.length > 0 ? filters : undefined,
    method: !!filters && filters.length > 0 ? 'post' : 'get',
  })

  const result = (await response.json()) as PaginatedProductsResponse

  if (result.success) {
    return result.data
  }
  return null
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
export const usePaginatedProducts = (data: Data, enabled = true) => {
  const { provinceID } = useUserShippingState()
  const { activeFilters } = useFiltersStore()

  return useQuery({
    enabled,
    keepPreviousData: true,
    queryFn: getPaginatedProducts,
    queryKey: [...PAGINATED_PRODUCTS_QUERY_KEY, { ...data, provinceID }, activeFilters || []],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useInfiniteProducts = (data: { categories?: number[]; page: number }) =>
  useQuery({
    getNextPageParam: lastPage => {
      if (lastPage !== null) {
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
