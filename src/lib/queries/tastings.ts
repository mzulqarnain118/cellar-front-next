import { useEffect, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../api'

export const TASTINGS_QUERY_KEY = ['tastings']

export const fetchTastings = async ({ consultantDisplayId }: { consultantDisplayId: any }) => {
  const response = await api('v2/user/GetTastingsList', {
    searchParams: { ConsultantDisplayID: parseInt(consultantDisplayId) },
  }).json()

  return response // Return the fetched data directly
}

export const useTastingsQuery = ({ consultantDisplayId }) => {
  const [fetched, setFetched] = useState(false) // State to track if data has been fetched
  const queryClient = useQueryClient()
  const { data: tastingsResponse } = useQuery({
    enabled: false,
    queryFn: fetchTastings,
    queryKey: TASTINGS_QUERY_KEY,
    onSuccess: () => {
      setFetched(true) // Set fetched to true to avoid refetching
    },
  })

  useEffect(() => {
    if (consultantDisplayId !== undefined && consultantDisplayId !== '1001' && !fetched) {
      // Fetch data when consultantDisplayId becomes available and data hasn't been fetched yet
      queryClient.prefetchQuery(TASTINGS_QUERY_KEY, () => fetchTastings({ consultantDisplayId }))
    }
  }, [consultantDisplayId, fetched, queryClient])

  return { data: tastingsResponse }
}
