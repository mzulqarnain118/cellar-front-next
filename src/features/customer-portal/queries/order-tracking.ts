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

export const getOrderTracking: QueryFunction<OrderTrackingInfo, string[]> = async ({
  queryKey,
}) => {
  try {
    const orderDisplayId = queryKey[1]
    const response = await api('v2/order/trackinginfo', {
      json: { OrderDisplayId: orderDisplayId },
      method: 'get',
    }).json<GetOrderTrackingInfoResponse>()

    if (!response.Success) {
      throw new Error(response.Error.Message)
    }

    return response.Data
  } catch {
    throw new Error('')
  }
}

export const useOrderTrackingQuery = (orderDisplayId: string) =>
  useQuery({
    queryFn: getOrderTracking,
    queryKey: ['order-tracking', orderDisplayId],
  })
