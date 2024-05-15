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
import { Cart, CartItem, ValidateCartOwnerResponse } from '@/lib/types'
import toast, { toastError, toastLoading, toastSuccess } from '@/lib/utils/notifications'

import { VIPCart, VIPCartResponse } from '../types'

export const getVipCart: QueryFunction<VIPCart | null, (string | undefined)[]> = async ({
  queryKey,
}) => {
  try {
    const orderDisplayId = queryKey[1]

    if (orderDisplayId === undefined) {
      return null
    }

    toastLoading({ message: 'Loading VIP cart...' })
    useProcessStore.getState().toggleCartOpen()
    const response = await api('v2/GetCartInfoFromOrderDisplayId', {
      method: 'get',
      searchParams: {
        OrderDisplayId: orderDisplayId,
      },
    }).json<VIPCartResponse>()

    notifications.clean()
    if (response.Success) {
      // toastSuccess({ message: 'VIP cart loaded successfully!' })
      return response.Data
    } else {
      toastError({ message: response.Error.Message || "We couldn't load that VIP cart." })
      return null
    }
  } catch {
    toastError({ message: "We couldn't load that VIP cart." })
    return null
  }
}

export const VIP_CART_QUERY_KEY = 'vip-cart'

export const useVipCartQuery = () => {
  const { query } = useRouter()
  const orderDisplayId = query.OrderID?.toString() || undefined
  const queryClient = useQueryClient()
  const { data: products } = useProductsQuery()
  const { data: session } = useSession()
  const { shippingState } = useShippingStateStore()
  const [_, setCartStorage] = useCartStorage()

  return useQuery({
    enabled: !!orderDisplayId,
    onSuccess: async data => {
      if (data) {
        notifications.clean()
        const { CartID, cart_information } = data

        if (session?.user) {
          const vipCartCheck = await api('v2/GetCartInfoFromOrderDisplayId', {
            method: 'get',
            searchParams: { OrderDisplayId: orderDisplayId || '' },
          }).json<VIPCartResponse>()

          if (vipCartCheck?.Success) {
            const cartOwnerCheck = await api('v2/ValidateCartOwnerSuccess', {
              json: {
                cartId: CartID || '',
              },
              method: 'post',
            }).json<ValidateCartOwnerResponse>()

            if (cartOwnerCheck.Success) {
              const updatedCartData = {
                discounts: [],
                id: CartID,
                isSharedCart: true,
                items: cart_information.OrderLines.map(item => {
                  const product = products?.find(
                    product => product.sku === item.ProductSKU.toLowerCase()
                  )

                  if (product) {
                    return {
                      ...product,
                      isVip: true,
                      orderId: item.OrderID,
                      orderLineId: item.OrderLineID,
                      quantity: item.Quantity,
                    } satisfies CartItem
                  } else {
                    return undefined
                  }
                }).filter(Boolean),
                orderDisplayId: cart_information.DisplayID,
                prices: {
                  orderTotal: 0,
                  retailDeliveryFee: 0,
                  shipping: 0,
                  subtotal: cart_information.Subtotal,
                  subtotalAfterSavings: cart_information.SubtotalAfterSavings,
                  tax: cart_information.TaxTotal,
                },
              }

              queryClient.setQueryData(
                [
                  ...CART_QUERY_KEY,
                  shippingState.provinceID || session?.user?.shippingState.provinceID,
                ],
                updatedCartData satisfies Cart
              )

              setCartStorage(updatedCartData)

              toastSuccess({ message: 'VIP cart loaded' })
            } else {
              toast(
                'error',
                'This cart is no longer valid. Please contact your Indepdent Consultant for more information.'
              )
            }
          } else {
            toast(
              'error',
              'This cart is no longer valid. Please contact your Indepdent Consultant for more information.'
            )
          }
        } else {
          const updatedCartData = {
            discounts: [],
            id: CartID,
            isSharedCart: true,
            items: cart_information.OrderLines.map(item => {
              const product = products?.find(
                product => product.sku === item.ProductSKU.toLowerCase()
              )

              if (product) {
                return {
                  ...product,
                  isVip: true,
                  orderId: item.OrderID,
                  orderLineId: item.OrderLineID,
                  quantity: item.Quantity,
                } satisfies CartItem
              } else {
                return undefined
              }
            }).filter(Boolean),
            orderDisplayId: cart_information.DisplayID,
            prices: {
              orderTotal: 0,
              retailDeliveryFee: 0,
              shipping: 0,
              subtotal: cart_information.Subtotal,
              subtotalAfterSavings: cart_information.SubtotalAfterSavings,
              tax: cart_information.TaxTotal,
            },
          }

          queryClient.setQueryData(
            [
              ...CART_QUERY_KEY,
              shippingState.provinceID || session?.user?.shippingState.provinceID,
            ],
            updatedCartData satisfies Cart
          )

          setCartStorage(updatedCartData)
          toastSuccess({ message: 'VIP cart loaded' })
        }
      }
    },
    queryFn: getVipCart,
    queryKey: [VIP_CART_QUERY_KEY, orderDisplayId],
  })
}
