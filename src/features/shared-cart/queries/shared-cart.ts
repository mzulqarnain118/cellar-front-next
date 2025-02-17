import { useMemo } from 'react'

import { useRouter } from 'next/router'

import { notifications } from '@mantine/notifications'
import { QueryFunction, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY } from '@/lib/queries/cart'
import { useProductsQuery } from '@/lib/queries/products'
import { useProcessStore } from '@/lib/stores/process'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart, CartItem } from '@/lib/types'
import { toastLoading } from '@/lib/utils/notifications'

import { GetSharedCartResponse } from '../types'

export const getSharedCart: QueryFunction<
  GetSharedCartResponse | null,
  (string | number | undefined)[]
> = async ({ queryKey }) => {
  try {
    const sharedCartId = queryKey[1]
    const provinceId = queryKey[2]
    if (sharedCartId === undefined) {
      return null
    }
    useProcessStore.getState().toggleCartOpen()
    toastLoading({ message: 'Loading shared cart...' })
    const response = await api('v2/GetSharedCart', {
      json: { ProvinceId: provinceId, SharedCartId: sharedCartId },
      method: 'post',
    }).json<GetSharedCartResponse>()

    return response
  } catch {
    throw new Error('There was an error loading the shared cart.')
  }
}

export const useSharedCartQuery = () => {
  const { query } = useRouter()
  const { shippingState } = useShippingStateStore()
  const sharedCartId = useMemo(() => query.sharedcartId?.toString(), [query.sharedcartId])
  const provinceId = useMemo(() => shippingState.provinceID, [shippingState.provinceID])
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { data: products } = useProductsQuery()
  const [_, setCartStorage] = useCartStorage()

  return useQuery({
    enabled: !!sharedCartId,
    onSuccess: response => {
      if (response?.Success) {
        notifications.clean()
        const { Cart, CartId } = response.Data

        const updatedCartData = {
          discounts: [],
          id: CartId,
          isSharedCart: true,
          items: Cart.OrderLines.map(item => {
            const product = products?.find(product => product.sku === item.ProductSKU.toLowerCase())

            if (product) {
              return {
                ...product,
                orderId: item.OrderID,
                orderLineId: item.OrderLineID,
                quantity: item.Quantity,
              } satisfies CartItem
            } else {
              return undefined
            }
          }).filter(Boolean),
          orderDisplayId: Cart.DisplayID,
          prices: {
            orderTotal: 0,
            retailDeliveryFee: 0,
            shipping: 0,
            subtotal: Cart.Subtotal,
            subtotalAfterSavings: Cart.SubtotalAfterSavings,
            tax: Cart.TaxTotal,
          },
        }

        queryClient.setQueryData(
          [...CART_QUERY_KEY, shippingState.provinceID || session?.user?.shippingState.provinceID],
          updatedCartData satisfies Cart
        )

        setCartStorage(updatedCartData)
      }
    },
    queryFn: getSharedCart,
    queryKey: ['shared-cart', sharedCartId, provinceId],
  })
}
