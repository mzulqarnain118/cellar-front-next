import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

interface GetBannersTranslatedResponse {
  BannerID: number
  BannerTypeID: number
  BusinessUnitID: number | null
  DisplayOnAllPages: boolean
  DisplayOrder: number
  Html: string | null
  ImageURL: string | null
  LinkTarget: string | null
  LinkURL: string | null
  MobileImageURL: string | null
  PersonTypeID: number
  Title: string | null
}

export const getCustomerPortalBanner = async () => {
  try {
    const response = await api('Banners/GetBannersTranslated', {
      searchParams: { BannerLocationID: 1 },
    }).json<GetBannersTranslatedResponse[]>()

    const {
      BannerID: bannerId,
      BannerTypeID: bannerTypeId,
      BusinessUnitID: businessUnitId,
      DisplayOnAllPages: displayOnAllPages,
      DisplayOrder: displayOrder,
      Html: html,
      ImageURL: imageUrl,
      LinkTarget: linkTarget,
      LinkURL: linkUrl,
      MobileImageURL: mobileImageUrl,
      PersonTypeID: personTypeId,
      Title: title,
    } = response[0]

    return {
      bannerId,
      bannerTypeId,
      businessUnitId,
      displayOnAllPages,
      displayOrder,
      html,
      imageUrl,
      linkTarget,
      linkUrl,
      mobileImageUrl,
      personTypeId,
      title,
    }
  } catch {
    throw new Error('')
  }
}

export const CUSTOMER_PORTAL_BANNER_QUERY_KEY = ['customer-portal-banner']

export const useCustomerPortalBanner = () =>
  useQuery({ queryFn: getCustomerPortalBanner, queryKey: CUSTOMER_PORTAL_BANNER_QUERY_KEY })
