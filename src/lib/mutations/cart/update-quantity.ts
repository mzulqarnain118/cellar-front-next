import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceItemByUniqueId } from '@/core/utils'
import { api } from '@/lib/api'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { Cart, CartProduct, DEFAULT_CART_STATE } from '@/lib/types'

import { fetchSubtotalAndUpdateCart, getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface UpdateQuantityOptions {
  cartId: string
  fetchSubtotal?: boolean
  item: Omit<CartProduct, 'orderLineId' | 'orderId' | 'quantity'>
  orderId: number
  orderLineId: number
  originalCartItems: CartProduct[]
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
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()

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
        setIsMutatingCart(true)
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

        return { previousCart }
      },
      onSettled: () => {
        setIsMutatingCart(false)
      },
    }
  )
}
