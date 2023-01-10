import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { api } from '../api'
import { DEFAULT_CONSULTANT_STATE, useConsultantStore } from '../stores/consultant'
import { Consultant } from '../types'

export const CONSULTANT_QUERY_KEY = 'consultant'
export const getConsultantData: QueryFunction<Consultant> = async ({ queryKey }) => {
  const [_, repUrl] = queryKey
  if (!repUrl) {
    return DEFAULT_CONSULTANT_STATE
  }

  const response = await api(`info/rep/${repUrl}`).json<{
    DisplayID: string
    DisplayName: string
    Url: string
  }>()

  if (!response.DisplayID) {
    return DEFAULT_CONSULTANT_STATE
  }

  const consultant: Consultant = {
    displayId: response.DisplayID,
    displayName: response.DisplayName,
    url: response.Url,
  }

  return consultant
}

export const useConsultantQuery = () => {
  const { consultant, setConsultant } = useConsultantStore()
  const { query } = useRouter()
  const repUrl = query.u?.toString() || consultant.url

  return useQuery({
    initialData: DEFAULT_CONSULTANT_STATE,
    onError: () => setConsultant(DEFAULT_CONSULTANT_STATE),
    onSuccess: data => {
      setConsultant(data)
    },
    queryFn: getConsultantData,
    queryKey: [CONSULTANT_QUERY_KEY, repUrl],
    refetchOnWindowFocus: false,
  })
}
