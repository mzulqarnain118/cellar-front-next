import { useRouter } from 'next/router'

import { notifications } from '@mantine/notifications'
import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '../api'
import { CORPORATE_CONSULTANT_ID } from '../constants'
import { DEFAULT_CONSULTANT_STATE, useConsultantStore } from '../stores/consultant'
import { Consultant } from '../types'
import { toastInfo } from '../utils/notifications'

export const CONSULTANT_QUERY_KEY = 'consultant'
export const getConsultantData: QueryFunction<Consultant> = async ({ queryKey }) => {
  const [_, repUrl] = queryKey
  if (!repUrl || repUrl === '1001') {
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
  notifications.clean()

  if (!response.DisplayID) {
    toastInfo({
      message:
        "We couldn't find that consultant. Go to scoutandcellar.com/consultants to find a consultant!",
    })
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
  const repUrl = query.u?.toString() || url || consultant?.url

  return useQuery({
    // cacheTime: 15 * (60 * 1000), // 15 mins
    initialData: DEFAULT_CONSULTANT_STATE,
    onError: () => setConsultant(DEFAULT_CONSULTANT_STATE),
    onSuccess: data => {
      setConsultant(data)
    },
    queryFn: getConsultantData,
    queryKey: [CONSULTANT_QUERY_KEY, repUrl || CORPORATE_CONSULTANT_ID],
    refetchOnWindowFocus: false,
    // staleTime: 10 * (60 * 1000), // 10 mins
  })
}
