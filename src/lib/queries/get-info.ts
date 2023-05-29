import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'

interface CartInfo {
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

interface GetViewCartInfoSuccess {
  Success: true
  Data: {
    Cart:
      | {
          Success: true
          Data: CartInfo
        }
      | Failure
  }
}

export type GetViewCartInfoResponse = GetViewCartInfoSuccess | Failure

export const getCartInfo: QueryFunction<CartInfo | undefined, (string | undefined)[]> = async ({
  queryKey,
}) => {
  try {
    const cartId = queryKey[1] as string
    const response = await api('v2/checkout/GetViewCartInfo', {
      method: 'get',
      searchParams: { cartId },
    }).json<GetViewCartInfoResponse>()

    if (response.Success && response.Data.Cart.Success) {
      return response.Data.Cart.Data
    }
  } catch {
    throw new Error('')
  }
}

export const CART_INFO_QUERY_KEY = 'cart-info'
export const useGetCartInfoQuery = (cartId?: string) => {
  const { data: cart } = useCartQuery()

  return useQuery({
    enabled: cartId !== undefined || !!cart?.id,
    queryFn: getCartInfo,
    queryKey: [CART_INFO_QUERY_KEY, cartId || cart?.id],
  })
}
