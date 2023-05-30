import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceItemByUniqueId } from '@/core/utils'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { GET_SUBTOTAL_QUERY, OrderPrice } from '@/lib/queries/checkout/get-subtotal'
import { toastError } from '@/lib/utils/notifications'

import { api } from '../../api'
import { useProcessStore } from '../../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../../types'
import { getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface AddToCartOptions {
  cartId?: string
  fetchSubtotal?: boolean
  originalCartItems: CartItem[]
  item: Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>
  quantity: number
  wineQuiz?: boolean
}

export const addToCart = async (options: AddToCartOptions) => {
  const response = await api('v2/checkout/AddToCart', {
    json: {
      CartID: options.cartId,
      Quantity: options.quantity,
      SKU: options.item.sku,
      WineQuiz: options.wineQuiz,
    },
    method: 'post',
  }).json<CartModificationResponse>()

  if (response.Success) {
    return response
  } else {
    throw new Error(response.Error.Traceback?.Notifications?.[0]?.Message)
  }
}

export const useAddToCartMutation = () => {
  const [_, setCartStorage] = useCartStorage()
  const { data: cart } = useCartQuery()
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()

  return useMutation<
    CartModificationResponse,
    Error,
    Pick<AddToCartOptions, 'fetchSubtotal' | 'item' | 'quantity' | 'wineQuiz'>,
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
        wineQuiz: options.wineQuiz || false,
      }),
    mutationKey: ['addToCart'],
    onError: (error, _product, context) => {
      queryClient.setQueryData(CART_QUERY_KEY, context?.previousCart)
      setCartStorage(context?.previousCart)
      toastError({ message: error.message })
    },
    onMutate: async product => {
      setIsMutatingCart(true)

      // Cancel any outgoing fetches.
      await queryClient.cancelQueries({
        queryKey: CART_QUERY_KEY,
      })

      // Snapshot the previous value.
      const previousCart = queryClient.getQueryData<Cart | undefined>(CART_QUERY_KEY)

      // Optimistically update to the new value.
      queryClient.setQueryData(CART_QUERY_KEY, () => {
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
    onSuccess: async (response, data) => {
      if (response.Success) {
        const newItems = getNewCartItems(
          response.data?.cart.OrderLines || response.Data.Cart.Data.OrderLines,
          cart?.items || [],
          data.item
        )
        const itemAdded = newItems.find(item => item.sku === data.item.sku)
        let modifiedItems: CartItem[] = newItems
        if (itemAdded) {
          modifiedItems = replaceItemByUniqueId<CartItem>(
            newItems,
            { field: 'sku', value: itemAdded.sku },
            {
              ...data.item,
              ...itemAdded,
            }
          )
        }
        let newCartData: Cart = {
          discounts: [],
          id: cart?.id || '',
          items: modifiedItems,
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
