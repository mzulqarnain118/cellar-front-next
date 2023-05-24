import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export interface ChargebeeData {
  CustomerDisplayId: string
  CustomerFirstName: string
  CustomerLastName: string
  SponsorDisplayId: string
  SponsorFirstName: string
  SponsorLastName: string
  SubscriptionCreateDate: string
  NumActiveSubscriptions: number
  NumPausedSubscriptions: number
  LastShippedDate: string | null
  ShipToState: string
  AlaCarteOrders365: number
  SKU: string
  BottleCount: number
  VarietalType: string
  Frequency: string
  ScoutRewards: number
  ProductDescription: string
}

export const getChargebeeData: QueryFunction<ChargebeeData, (string | number)[]> = async ({
  queryKey,
}) => {
  try {
    const subscriptionId = queryKey[1]
    const response = await api('v2/GetCustomerFromSubscription', {
      method: 'get',
      searchParams: {
        SubscriptionId: subscriptionId,
      },
    }).json<{ Success: boolean; Data: ChargebeeData[] }>()

    if (!response.Success) {
      throw new Error('')
    }
    return response.Data[0]
  } catch {
    throw new Error('')
  }
}

export const useChargebeeQuery = (subscriptionId: number, enabled = true) =>
  useQuery({ enabled, queryFn: getChargebeeData, queryKey: ['chargebee', subscriptionId] })
