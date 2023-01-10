import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceItemByUniqueId } from '@/core/utils'

import { api } from '../api'
import { CART_QUERY_KEY, useCartQuery } from '../queries/cart'
import { useProcessStore } from '../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../types'

import { fetchSubtotalAndUpdateCart, getNewCartItems } from './helpers'
import { CartModificationResponse } from './types'

export interface AddToCartOptions {
  cartId?: string
  fetchSubtotal?: boolean
  originalCartItems: CartItem[]
  item: CartItem
}

export const addToCart = async (options: AddToCartOptions) => {
  const response = await api('v2/checkout/AddToCart', {
    json: {
      CartID: options.cartId,
      Quantity: options.item.quantity,
      SKU: options.item.sku,
    },
    method: 'post',
  }).json<CartModificationResponse>()

  if (response.Success) {
    const newItems = getNewCartItems(response.Data.Cart.Data.OrderLines, options.originalCartItems)
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
    throw new Error('You may only have a maximum of 24 of each product.')
  }
}

export const useAddToCartMutation = () => {
  const { data } = useCartQuery()
  const { setCartOpen } = useProcessStore()
  const queryClient = useQueryClient()

  return useMutation<
    Cart | undefined,
    Error,
    Pick<AddToCartOptions, 'fetchSubtotal' | 'item'>,
    { previousCart?: Cart }
  >(
    ['addToCart'],
    options =>
      addToCart({
        ...options,
        cartId: data?.id,
        fetchSubtotal: options.fetchSubtotal || false,
        item: options.item,
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
          const existingItem = previousCart?.items.find(item => item.sku === product.item.sku)

          return previousCart !== undefined
            ? {
                ...previousCart,
                items:
                  existingItem !== undefined
                    ? replaceItemByUniqueId(
                        previousCart.items,
                        { field: 'sku', value: existingItem.sku },
                        { ...existingItem, quantity: existingItem.quantity + 1 }
                      )
                    : [...previousCart.items, product.item],
              }
            : DEFAULT_CART_STATE
        })

        setCartOpen(true)
        return { previousCart }
      },
      onSuccess: data => {
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, data)
      },
    }
  )
}
