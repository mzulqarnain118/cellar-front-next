import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCartStorage } from '@/lib/hooks/use-cart-storage'

import { api } from '../../api'
import { CART_QUERY_KEY, useCartQuery } from '../../queries/cart'
import { useProcessStore } from '../../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../../types'
import { fetchSubtotalAndUpdateCart, getNewCartItems } from '../helpers'
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
      const newItems = getNewCartItems(
        response.data?.cart.OrderLines || response.Data.Cart.Data.OrderLines,
        options.originalCartItems,
        options.item
      )
      try {
        return await fetchSubtotalAndUpdateCart(
          response.CartID,
          options.originalCartItems,
          {
            items: newItems,
            orderDisplayId: response.Data?.Cart.Data.DisplayID,
          },
          options.fetchSubtotal
        )
      } catch {
        throw new Error('There was an issue calculating the total of your cart.')
      }

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
    Pick<RemoveFromCartOptions, 'fetchSubtotal' | 'item' | 'sku'>,
    { previousCart?: Cart }
  >({
    mutationFn: options =>
      removeFromCart({
        ...options,
        cartId: data?.id || '',
        fetchSubtotal: options.fetchSubtotal || false,
        originalCartItems: data?.items || [],
      }),
    mutationKey: ['removeFromCart'],
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
    onSettled: data => {
      queryClient.setQueryData<Cart>(cartQueryKey, data)
      setCartStorage(data)
      setIsMutatingCart(false)
    },
  })
}
