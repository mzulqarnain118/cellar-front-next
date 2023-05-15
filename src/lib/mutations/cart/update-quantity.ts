import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceItemByUniqueId } from '@/core/utils'
import { api } from '@/lib/api'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { GET_SUBTOTAL_QUERY, OrderPrice } from '@/lib/queries/checkout/get-subtotal'
import { useProcessStore } from '@/lib/stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '@/lib/types'

import { getNewCartItems } from '../helpers'
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
  orderId,
  orderLineId,
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
      return response
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
  const { data: cart } = useCartQuery()
  const [_, setCartStorage] = useCartStorage()
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()

  return useMutation<
    CartModificationResponse,
    Error,
    Omit<UpdateQuantityOptions, 'cartId' | 'originalCartItems'>,
    { previousCart?: Cart }
  >({
    mutationFn: options =>
      updateQuantity({
        ...options,
        cartId: cart?.id || '',
        fetchSubtotal: options.fetchSubtotal || false,
        originalCartItems: cart?.items || [],
      }),
    mutationKey: ['updateQuantity'],
    onError: (_err, _product, context) => {
      queryClient.setQueryData(CART_QUERY_KEY, context?.previousCart)
      setCartStorage(context?.previousCart)
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
    onSuccess: async (response, data) => {
      if (response.Success) {
        const newItems = getNewCartItems(
          response.data?.cart.OrderLines || response.Data.Cart.Data.OrderLines,
          cart?.items || [],
          data.item
        )
        let newCartData: Cart = {
          discounts: [],
          id: cart?.id || '',
          items: newItems,
          orderDisplayId: response.Data?.Cart.Data.DisplayID,
          prices: {
            orderTotal: 0,
            retailDeliveryFee: 0,
            shipping: 0,
            subtotal: 0,
            subtotalAfterSavings: 0,
            tax: 0,
          },
        }

        if (data.fetchSubtotal) {
          const prices = await queryClient.fetchQuery<OrderPrice>([GET_SUBTOTAL_QUERY, cart?.id])
          newCartData = {
            ...newCartData,
            ...prices,
          }
        }
        queryClient.setQueryData(CART_QUERY_KEY, newCartData)
        setCartStorage(newCartData)
      }
    },
  })
}
