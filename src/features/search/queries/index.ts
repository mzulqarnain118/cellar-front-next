import { QueryFunction, useQuery } from '@tanstack/react-query'

import { localApi } from '@/lib/api'
import { useUserShippingState } from '@/lib/stores/user'
import { ProductsSchema } from '@/lib/types/schemas/product'
import { toastError } from '@/lib/utils/notifications'

interface SearchSuccess {
  data: {
    page: number
    perPage: number
    products: ProductsSchema[]
    results: number
    resultsShown: [number, number]
    totalNumberOfPages: number
  }
  success: true
}

interface SearchFailure {
  error: {
    message: string
  }
  success: false
}

interface Data {
  categories: number[]
  limit?: number
  page: number
  provinceId?: number
  search: string
  sort: 'relevant' | 'price-low-high' | 'price-high-low'
}

export type SearchResponse = SearchSuccess | SearchFailure

export const getSearchResult: QueryFunction<
  ProductsSchema[] | null,
  (string | number | Record<string, string>)[]
> = async ({ queryKey }) => {
  try {
    const data = queryKey[1] as Record<string, string>

    if (!data || typeof data === 'string' || data.search.length === 0) {
      return null
    }

    if (typeof data !== 'string') {
      const searchParams = new URLSearchParams(data)
      searchParams.delete('search')
      searchParams.set('q', data.search)
      const response = await localApi(
        `search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        {
          method: 'get',
        }
      ).json<SearchResponse>()

      if (response.success) {
        return response.data.products || null
      } else {
        toastError({ message: response.error.message })
      }
      return null
    }
    return null
  } catch {
    return null
  }
}

export const getPaginatedSearchResult: QueryFunction<
  SearchSuccess['data'] | null,
  (string | number | Data | Record<string, string>)[]
> = async ({ queryKey }) => {
  try {
    const data = queryKey[1] as Record<string, string>

    if (!data || typeof data === 'string' || data.search.length === 0) {
      return null
    }

    if (typeof data !== 'string') {
      const searchParams = new URLSearchParams(data)
      searchParams.delete('search')
      searchParams.set('q', data.search)
      const response = await localApi(
        `search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        {
          method: 'get',
        }
      ).json<SearchResponse>()

      if (response.success) {
        return response.data || null
      } else {
        toastError({ message: response.error.message })
      }
      return null
    }
    return null
  } catch {
    return null
  }
}

export const SEARCH_QUERY_KEY = 'search'

export const useSearchQuery = (data: { search: string }) => {
  const { provinceID: _ } = useUserShippingState()

  return useQuery({
    queryFn: getSearchResult,
    queryKey: [SEARCH_QUERY_KEY, data],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
export const PAGINATED_SEARCH_QUERY_KEY = 'paginated-search'
export const usePaginatedSearch = (data: Data, enabled = true) => {
  const { provinceID } = useUserShippingState()

  return useQuery({
    enabled,
    keepPreviousData: true,
    queryFn: getPaginatedSearchResult,
    queryKey: [PAGINATED_SEARCH_QUERY_KEY, { ...data, provinceID }],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
