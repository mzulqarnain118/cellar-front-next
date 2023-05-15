import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { GET_SUBTOTAL_QUERY, OrderPrice } from '@/lib/queries/checkout/get-subtotal'

import { api } from '../../api'
import { CART_QUERY_KEY, useCartQuery } from '../../queries/cart'
import { useProcessStore } from '../../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../../types'
import { getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface RemoveFromCartOptions {
  cartId: string
  fetchSubtotal?: boolean
  item: Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>
  sku: string
  originalCartItems: CartItem[]
}

export const removeFromCart = async (options: RemoveFromCartOptions) => {
  try {
    const product = options.originalCartItems.find(product => product.sku === options.sku)
    if (product === undefined) {
      throw new Error('This item does not exist in your cart.')
    }
    const response = await api('v2/checkout/RemoveLineItem', {
      json: { CartID: options.cartId, OrderLineID: product.orderLineId },
      method: 'put',
    }).json<CartModificationResponse>()

    if (response.Success) {
      return response

      // if (newItems.length === 0 && localStorage.getItem('giftMessage')) {
      //   queryClient.invalidateQueries(CART_QUERY_KEY)
      //   localStorage.removeItem('giftMessage')
      // }
    } else {
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error('There was an issue removing the item from your cart. Please try again later.')
  }
}

export const useRemoveFromCartMutation = () => {
  const { data: cart } = useCartQuery()
  const [_, setCartStorage] = useCartStorage()
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()

  return useMutation<
    CartModificationResponse,
    Error,
    Pick<RemoveFromCartOptions, 'fetchSubtotal' | 'item' | 'sku'>,
    { previousCart?: Cart }
  >({
    mutationFn: options =>
      removeFromCart({
        ...options,
        cartId: cart?.id || '',
        fetchSubtotal: options.fetchSubtotal || false,
        originalCartItems: cart?.items || [],
      }),
    mutationKey: ['removeFromCart'],
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
        const newCart =
          previousCart !== undefined
            ? {
                ...previousCart,
                items: previousCart.items.filter(item => item.sku !== product.sku),
              }
            : DEFAULT_CART_STATE

        return newCart
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
