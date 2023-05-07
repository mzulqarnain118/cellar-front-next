import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { replaceItemByUniqueId } from '@/core/utils'
import { api } from '@/lib/api'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '@/lib/types'

import { fetchSubtotalAndUpdateCart, getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface UpdateQuantityOptions {
  cartId: string
  fetchSubtotal?: boolean
  item: Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>
  orderId: number
  orderLineId: number
  originalCartItems: CartItem[]
  quantity: number
}

export const updateQuantity = async ({
  cartId,
  fetchSubtotal,
  item,
  orderId,
  orderLineId,
  originalCartItems,
  quantity,
}: UpdateQuantityOptions) => {
  try {
    const response = await api('v2/checkout/UpdateOrderLineQuantity', {
      json: {
        CartID: cartId,
        OrderID: orderId,
        OrderLineID: orderLineId,
        Quantity: quantity,
      },
      method: 'put',
    }).json<CartModificationResponse>()

    if (response.Success) {
      const newItems = getNewCartItems(
        response.data?.cart.OrderLines || response.Data.Cart.Data.OrderLines,
        originalCartItems,
        item
      )
      try {
        return await fetchSubtotalAndUpdateCart(
          cartId,
          originalCartItems,
          {
            items: newItems,
            orderDisplayId: response.Data?.Cart.Data.DisplayID,
          },
          fetchSubtotal
        )
      } catch (error) {
        throw new Error('There was an issue calculating the total of your cart.')
      }
    } else {
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error(
      'There was an issue updating the quantity of the product. Please try again later.'
    )
  }
}

export const useUpdateQuantityMutation = () => {
  const { data } = useCartQuery()
  const [_, setCartStorage] = useCartStorage()
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()
  const { data: session } = useSession()
  const cartQueryKey = useMemo(
    () => [...CART_QUERY_KEY, { isLoggedIn: !!session?.user, provinceId: 48 }],
    [session?.user]
  )

  return useMutation<
    Cart | undefined,
    Error,
    Omit<UpdateQuantityOptions, 'cartId' | 'originalCartItems'>,
    { previousCart?: Cart }
  >({
    mutationFn: options =>
      updateQuantity({
        ...options,
        cartId: data?.id || '',
        fetchSubtotal: options.fetchSubtotal || false,
        originalCartItems: data?.items || [],
      }),
    mutationKey: ['updateQuantity'],
    onError: (_err, _product, context) => {
      queryClient.setQueryData(cartQueryKey, context?.previousCart)
      setCartStorage(context?.previousCart)
    },
    onMutate: async product => {
      setIsMutatingCart(true)
      // Cancel any outgoing fetches.
      await queryClient.cancelQueries({ queryKey: cartQueryKey })

      // Snapshot the previous value.
      const previousCart = queryClient.getQueryData<Cart | undefined>(cartQueryKey)

      // Optimistically update to the new value.
      queryClient.setQueryData<Cart>(cartQueryKey, () => {
        const existingItem = previousCart?.items.find(
          item => item.orderLineId === product.orderLineId
        )
        return previousCart !== undefined
          ? {
              ...previousCart,
              items:
                existingItem !== undefined
                  ? replaceItemByUniqueId(
                      previousCart.items,
                      { field: 'sku', value: existingItem.sku },
                      { ...existingItem, quantity: product.quantity }
                    )
                  : previousCart.items,
            }
          : DEFAULT_CART_STATE
      })

      return { previousCart }
    },
    onSettled: data => {
      queryClient.setQueryData<Cart>(cartQueryKey, data)
      setCartStorage(data)
      setIsMutatingCart(false)
    },
  })
}
