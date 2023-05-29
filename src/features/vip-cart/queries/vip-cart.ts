import { useRouter } from 'next/router'

import { notifications } from '@mantine/notifications'
import { QueryFunction, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { CART_QUERY_KEY } from '@/lib/queries/cart'
import { useProductsQuery } from '@/lib/queries/products'
import { useProcessStore } from '@/lib/stores/process'
import { Cart, CartItem } from '@/lib/types'
import { toastError, toastLoading, toastSuccess } from '@/lib/utils/notifications'

import { VIPCart, VIPCartResponse } from '../types'

export const getVipCart: QueryFunction<VIPCart | undefined, (string | undefined)[]> = async ({
  queryKey,
}) => {
  try {
    const orderDisplayId = queryKey[1]

    if (orderDisplayId === undefined) {
      return
    }
    useProcessStore.getState().toggleCartOpen()
    toastLoading({ message: 'Loading VIP cart...' })
    const response = await api('v2/GetCartInfoFromOrderDisplayId', {
      method: 'get',
      searchParams: {
        OrderDisplayId: orderDisplayId,
      },
    }).json<VIPCartResponse>()

    notifications.clean()
    if (response.Success) {
      toastSuccess({ message: 'VIP cart loaded successfully!' })
      return response.Data
    } else {
      toastError({ message: response.Error.Message || "We couldn't load that VIP cart." })
    }
  } catch {
    toastError({ message: "We couldn't load that VIP cart." })
  }
}

export const VIP_CART_QUERY_KEY = 'vip-cart'

export const useVipCartQuery = () => {
  const { query } = useRouter()
  const orderDisplayId = query.OrderID?.toString() || undefined
  const queryClient = useQueryClient()
  const { data: products } = useProductsQuery()

  return useQuery({
    enabled: !!orderDisplayId,
    onSuccess: data => {
      if (data) {
        notifications.clean()
        const { CartID, cart_information } = data
        queryClient.setQueryData([...CART_QUERY_KEY], {
          discounts: [],
          id: CartID,
          isSharedCart: true,
          items: cart_information.OrderLines.map(item => {
            const product = products?.find(product => product.sku === item.ProductSKU.toLowerCase())

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
        } satisfies Cart)
        toastSuccess({ message: 'VIP cart loaded' })
      }
    },
    queryFn: getVipCart,
    queryKey: [VIP_CART_QUERY_KEY, orderDisplayId],
  })
}
