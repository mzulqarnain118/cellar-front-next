import { useMemo } from 'react'

import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { replaceItemByUniqueId } from '@/core/utils'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'

import { api } from '../../api'
import { useProcessStore } from '../../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../../types'
import { fetchSubtotalAndUpdateCart, getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface AddToCartOptions {
  cartId?: string
  fetchSubtotal?: boolean
  originalCartItems: CartItem[]
  item: Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>
  quantity: number
}

export const addToCart = async (options: AddToCartOptions) => {
  const response = await api('v2/checkout/AddToCart', {
    json: {
      CartID: options.cartId,
      Quantity: options.quantity,
      SKU: options.item.sku,
    },
    method: 'post',
  }).json<CartModificationResponse>()

  if (response.Success) {
    const newItems = getNewCartItems(
      response.data?.cart.OrderLines || response.Data.Cart.Data.OrderLines,
      options.originalCartItems,
      options.item
    )
    const itemAdded = newItems.find(item => item.sku === options.item.sku)
    let modifiedItems: CartItem[] = newItems
    if (itemAdded) {
      modifiedItems = replaceItemByUniqueId<CartItem>(
        newItems,
        { field: 'sku', value: itemAdded.sku },
        {
          ...options.item,
          ...itemAdded,
        }
      )
    }
    try {
      return await fetchSubtotalAndUpdateCart(
        response.CartID,
        options.originalCartItems,
        {
          items: modifiedItems,
          orderDisplayId: response.Data?.Cart.Data.DisplayID,
        },
        options.fetchSubtotal
      )
    } catch {
      throw new Error('There was an issue calculating the total of your cart.')
    }
  } else {
    throw new Error(response.Error.Traceback?.Notifications?.[0]?.Message)
  }
}

export const useAddToCartMutation = () => {
  const [_, setCartStorage] = useCartStorage()
  const { data: cart } = useCartQuery()
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
    Pick<AddToCartOptions, 'fetchSubtotal' | 'item' | 'quantity'>,
    { previousCart?: Cart }
  >({
    mutationFn: options =>
      addToCart({
        ...options,
        cartId: cart?.id,
        fetchSubtotal: options.fetchSubtotal || false,
        item: options.item,
        originalCartItems: cart?.items || [],
        quantity: options.quantity,
      }),
    mutationKey: ['addToCart'],
    onError: (error, _product, context) => {
      queryClient.setQueryData(cartQueryKey, context?.previousCart)
      setCartStorage(context?.previousCart)
      showNotification({ message: error.message })
    },
    onMutate: async product => {
      setIsMutatingCart(true)

      // Cancel any outgoing fetches.
      await queryClient.cancelQueries({
        queryKey: cartQueryKey,
      })

      // Snapshot the previous value.
      const previousCart = queryClient.getQueryData<Cart | undefined>(cartQueryKey)

      // Optimistically update to the new value.
      queryClient.setQueryData(cartQueryKey, () => {
        const existingItem = previousCart?.items.find(item => item.sku === product.item.sku)

        return previousCart !== undefined
          ? {
              ...previousCart,
              items:
                existingItem !== undefined
                  ? replaceItemByUniqueId(
                      previousCart.items,
                      { field: 'sku', value: existingItem.sku },
                      { ...existingItem, quantity: product.quantity || existingItem.quantity + 1 }
                    )
                  : [...previousCart.items, product.item],
            }
          : DEFAULT_CART_STATE
      })

      return { previousCart }
    },
    onSettled: () => {
      setIsMutatingCart(false)
    },
    onSuccess: data => {
      queryClient.setQueryData<Cart>(cartQueryKey, data)
      setCartStorage(data)
    },
  })
}
