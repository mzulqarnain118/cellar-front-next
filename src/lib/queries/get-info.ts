import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'

interface GetViewCartInfoSuccess {
  Success: true
  Data: {
    Cart:
      | {
          Success: true
          Data: {
            DisplayID: string
            OrderLines: {
              ProductImage: string
              Price: number
              DisplayPrice: number
              ProductSKU: string
              ProductDisplayName: string
              Quantity: number
              OrderLineID: number
              OrderID: number
            }[]
          }
        }
      | Failure
  }
}

export type GetViewCartInfoResponse = GetViewCartInfoSuccess | Failure

export const getCartInfo: QueryFunction<GetViewCartInfoResponse> = async ({ queryKey }) => {
  try {
    const cartId = queryKey[1] as string
    const response = await api('v2/checkout/GetViewCartInfo', {
      method: 'get',
      searchParams: { cartId },
    }).json<GetViewCartInfoResponse>()
    return response
  } catch {
    throw new Error('')
  }
}

export const CART_INFO_QUERY_KEY = 'cart-info'
export const useGetCartInfoQuery = () => {
  const { data: cart } = useCartQuery()

  return useQuery({ queryFn: getCartInfo, queryKey: [CART_INFO_QUERY_KEY, cart?.id] })
}
