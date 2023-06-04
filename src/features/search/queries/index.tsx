import { useMemo } from 'react'

import { QueryFunction, useQuery } from '@tanstack/react-query'

import { localApi } from '@/lib/api'
import { useUserShippingState } from '@/lib/stores/user'
import { toastError } from '@/lib/utils/notifications'

import { FuseSearchResult } from 'src/pages/api/search'

interface SearchSuccess {
  data: FuseSearchResult
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
  FuseSearchResult | null,
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
        return response.data
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

export const PAGINATED_SEARCH_QUERY_KEY = 'paginated-search'

export const usePaginatedSearchQuery = (data: Data) => {
  const { provinceID } = useUserShippingState()
  const queryData = useMemo(
    () => ({
      categories: data.categories,
      limit: data.limit,
      page: data.page,
      provinceId: provinceID,
      search: data.search,
      sort: data.sort,
    }),
    [data.categories, data.limit, data.page, data.search, data.sort, provinceID]
  )

  return useQuery({
    keepPreviousData: true,
    queryFn: getSearchResult,
    queryKey: [PAGINATED_SEARCH_QUERY_KEY, queryData],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
