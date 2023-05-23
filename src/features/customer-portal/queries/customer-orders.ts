import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { Failure } from '@/lib/types'

export interface CustomerOrder {
  DisplayID: string
  OrderAddress: {
    City: string
    PostalCode: string
    ProvinceName: string
    Street1: string
    Street2: string
  }
  OrderDate: string
  OrderLines: {
    DisplayName: string
    LinePrice: number
    ProductImageURL: string
    Quantity: number
    SKU: string
  }[]
  OrderPaymentStatusName: string
  OrderStatusID: number
  OrderStatusName: string
  OrderTotal: number
  PaymentMethod: string
  ShippingMethodID: number
}

interface GetCustomerOrdersSuccess {
  Success: true
  Data: CustomerOrder[]
}

type GetCustomerOrdersResponse = GetCustomerOrdersSuccess | Failure

export const getCustomerOrders: QueryFunction<CustomerOrder[], string[]> = async () => {
  try {
    const response = await api('v2/Orders/GetPersonalOrders', {
      method: 'get',
      searchParams: { subscriptionId: 0 },
    }).json<GetCustomerOrdersResponse>()

    if (!response.Success) {
      throw new Error(response.Error.Message)
    }

    return response.Data
  } catch {
    throw new Error('')
  }
}

export const CUSTOMER_ORDERS_QUERY_KEY = 'customer-orders'

export const useCustomerOrdersQuery = () => {
  const { data: session } = useSession()

  return useQuery({
    queryFn: getCustomerOrders,
    queryKey: [CUSTOMER_ORDERS_QUERY_KEY, session?.user?.displayId || ''],
  })
}
