import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { api } from '../api'
import { CORPORATE_CONSULTANT_ID } from '../constants'
import { DEFAULT_CONSULTANT_STATE, useConsultantStore } from '../stores/consultant'
import { Consultant } from '../types'

export const CONSULTANT_QUERY_KEY = 'consultant'
export const getConsultantData: QueryFunction<Consultant> = async ({ queryKey }) => {
  const [_, repUrl] = queryKey
  if (!repUrl) {
    return DEFAULT_CONSULTANT_STATE
  }

  const response = await api(`info/rep/${repUrl}`).json<{
    Address: { City: string; PostalCode: string; ProvinceAbbreviation: string }
    DisplayID: string
    DisplayName: string
    EmailAddress: string
    ImageURL: string
    PhoneNumber: string
    ProfileWebsite: string
    SocialLinks: {
      LinkBaseURL: string
      LinkName: string
      URL: string
    }[]
    Url: string
  }>()

  if (!response.DisplayID) {
    return DEFAULT_CONSULTANT_STATE
  }

  const consultant: Consultant = {
    address: {
      city: response.Address?.City,
      stateAbbreviation: response.Address?.ProvinceAbbreviation,
      zipCode: response.Address?.PostalCode,
    },
    displayId: response.DisplayID,
    displayName: response.DisplayName || '',
    emailAddress: response.EmailAddress || undefined,
    imageUrl: response.ImageURL || undefined,
    phoneNumber: response.PhoneNumber || undefined,
    profileWebsite: response.ProfileWebsite || undefined,
    socialLinks: response.SocialLinks.map(link => ({
      baseUrl: link.LinkBaseURL,
      name: link.LinkName,
      url: link.URL,
    })),
    url: response.Url,
  }

  return consultant
}

export const useConsultantQuery = (url?: string) => {
  const { consultant, setConsultant } = useConsultantStore()
  const { query } = useRouter()
  const repUrl = url || consultant?.url || query.u?.toString()

  return useQuery({
    initialData: DEFAULT_CONSULTANT_STATE,
    onError: () => setConsultant(DEFAULT_CONSULTANT_STATE),
    onSuccess: data => {
      setConsultant(data)
    },
    queryFn: getConsultantData,
    queryKey: [CONSULTANT_QUERY_KEY, repUrl || CORPORATE_CONSULTANT_ID],
    refetchOnWindowFocus: false,
  })
}
