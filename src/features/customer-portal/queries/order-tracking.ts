import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { Failure } from '@/lib/types'

interface OrderTrackingInfo {
  TrackingNumberLinks: {
    Key: string
    Value: string
  }[]
  TrackingUrl: string
}

interface GetOrderTrackingInfoSuccess {
  Success: true
  Data: OrderTrackingInfo
}

type GetOrderTrackingInfoResponse = GetOrderTrackingInfoSuccess | Failure

export const getOrderTracking: QueryFunction<OrderTrackingInfo | null, string[]> = async ({
  queryKey,
}) => {
  try {
    const orderDisplayId = queryKey[1]
    const response = await api('v2/order/trackinginfo', {
      json: { OrderDisplayId: orderDisplayId },
      method: 'post',
    }).json<GetOrderTrackingInfoResponse>()

    if (!response.Success) {
      throw new Error(response.Error.Message)
    }

    return response.Data
  } catch (error) {
    throw new Error('There was an error fetching the tracking data.')
  }
}

export const useOrderTrackingQuery = (orderDisplayId: string, enabled = true) =>
  useQuery({
    enabled,
    queryFn: getOrderTracking,
    queryKey: ['order-tracking', orderDisplayId],
  })
