import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceItemByUniqueId } from '@/core/utils'

import { api } from '../api'
import { CART_QUERY_KEY, useCartQuery } from '../queries/cart'
import { useProcessStore } from '../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../types'

import { fetchSubtotalAndUpdateCart, getNewCartItems } from './helpers'
import { CartModificationResponse } from './types'

export interface UpdateQuantityOptions {
  cartId: string
  fetchSubtotal?: boolean
  orderId: number
  orderLineId: number
  originalCartItems: CartItem[]
  quantity: number
}

export const updateQuantity = async ({
  cartId,
  fetchSubtotal,
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
      const newItems = getNewCartItems(response.Data.Cart.Data.OrderLines, originalCartItems)
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
    }
  } catch {
    throw new Error(
      'There was an issue updating the quantity of the product. Please try again later.'
    )
  }
}

export const useUpdateQuantityMutation = () => {
  const { data } = useCartQuery()
  const { setCartOpen } = useProcessStore()
  const queryClient = useQueryClient()

  return useMutation<
    Cart | undefined,
    Error,
    Omit<UpdateQuantityOptions, 'cartId' | 'originalCartItems'>,
    { previousCart?: Cart }
  >(
    ['updateQuantity'],
    options =>
      updateQuantity({
        ...options,
        cartId: data?.id || '',
        fetchSubtotal: options.fetchSubtotal || false,
        originalCartItems: data?.items || [],
      }),
    {
      onError: (_err, _product, context) => {
        queryClient.setQueryData(CART_QUERY_KEY, context?.previousCart)
      },
      onMutate: async product => {
        // Cancel any outgoing fetches.
        await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })

        // Snapshot the previous value.
        const previousCart = queryClient.getQueryData<Cart | undefined>(CART_QUERY_KEY)

        // Optimistically update to the new value.
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, () => {
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

        setCartOpen(true)
        return { previousCart }
      },
    }
  )
}
