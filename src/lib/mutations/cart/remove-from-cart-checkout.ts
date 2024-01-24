ximport { useMemo } from 'react'

import { useRouter } from 'next/router'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { GET_SUBTOTAL_QUERY, OrderPrice } from '@/lib/queries/checkout/get-subtotal'
import { useCheckoutActions, useCheckoutAppliedSkyWallet } from '@/lib/stores/checkout'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { toastInfo } from '@/lib/utils/notifications'

import { api } from '../../api'
import { CART_QUERY_KEY, useCartQuery } from '../../queries/cart'
import { useProcessStore } from '../../stores/process'
import { Cart, CartItem, DEFAULT_CART_STATE } from '../../types'
import { getNewCartItems } from '../helpers'
import { CartModificationResponse } from '../types'

export interface RemoveFromCartCheckoutOptions {
  cartId: string
  fetchSubtotal?: boolean
  item: Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>
  sku: string
  originalCartItems: CartItem[]
}

export const removeFromCart = async (options: RemoveFromCartCheckoutOptions) => {
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
    } else {
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error('There was an issue removing the item from your cart. Please try again later.')
  }
}

export const useRemoveFromCartMutation = () => {
  const appliedSkyWallet = useCheckoutAppliedSkyWallet()
  const { setAppliedSkyWallet } = useCheckoutActions()
  const { data: cart } = useCartQuery()
  const [_, setCartStorage] = useCartStorage()
  const queryClient = useQueryClient()
  const { setIsMutatingCart } = useProcessStore()
  const { shippingState } = useShippingStateStore()
  const { data: session } = useSession()
  const queryKey = useMemo(
    () => [...CART_QUERY_KEY, shippingState.provinceID || session?.user?.shippingState.provinceID],
    [session?.user?.shippingState.provinceID, shippingState]
  )
  const router = useRouter()

  return useMutation<
    CartModificationResponse,
    Error,
    Pick<RemoveFromCartCheckoutOptions, 'fetchSubtotal' | 'item' | 'sku'>,
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
      queryClient.setQueryData(queryKey, context?.previousCart)
      setCartStorage(context?.previousCart)
    },
    onMutate: async product => {
      setIsMutatingCart(true)
      // Cancel any outgoing fetches.
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value.
      const previousCart = queryClient.getQueryData<Cart | undefined>(queryKey)

      // Optimistically update to the new value.
      queryClient.setQueryData<Cart>(queryKey, () => {
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
        queryClient.setQueryData(queryKey, newCartData)
        setCartStorage(newCartData)

        if (router.asPath === CHECKOUT_PAGE_PATH && appliedSkyWallet > 0) {
          setAppliedSkyWallet(0)
          toastInfo({
            message:
              'Your applied credit amount was reset due to changes in your cart. Please re-apply the desired balance.',
          })
        }
      }
    },
  })
}
