import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'

export type Subscription = {
  Address?: {
    City: string
    FirstName: string
    LastName: string
    PostalCode: string
    ProvinceName: string
    Street1: string
    Street2: string | null
  }
  AllowUserCancelSubscription: boolean
  DateCreated: string
  Enabled: boolean
  Frequency: string
  NextProcessingDate: string
  PaymentDisplayNumber: string
  PaymentType: string
  Price: number
  ProductDisplayName: string
  ProductImageURL: string
  Quantity: number
  ShippingMethodID: number
  ShippingMethodName: string
  SKU: string
  SubscriptionID: number
  WebsiteID: number
}

export const getSubscriptions: QueryFunction<Subscription[] | null, string[]> = async ({
  queryKey,
}) => {
  try {
    const type = queryKey[2]
    const response = await api('GetSubscriptionsToDisplay', {
      method: 'get',
      searchParams: {
        Type: type,
      },
    }).json<Subscription[]>()

    return response
  } catch {
    return null
  }
}

export const useSubscriptionsQuery = (type: 'AutoShip' | 'Club-Subscription') => {
  const { data: session } = useSession()

  return useQuery({
    queryFn: getSubscriptions,
    queryKey: ['subscriptions', session?.user?.displayId || '', type],
  })
}
