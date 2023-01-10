import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '../api'
import { useShippingStateStore } from '../stores/shipping-state'
import { Cart } from '../types'

interface CreateCartOptions {
  cartId?: string
  cartItems?: Cart['items']
  isLoggedIn?: boolean
  orderDisplayId?: string
  provinceId?: number
}

const createCart = async (options?: CreateCartOptions): Promise<Cart> => {
  const newCartItems =
    options?.cartItems?.map(({ sku, quantity }) => ({ Quantity: quantity, SKU: sku })) || []

  const response = await api('shop/CreateCart', {
    json: { LineItems: newCartItems || [] },
    method: 'post',
    searchParams: {
      provinceId: options?.provinceId || 48,
      sessionId: '',
    },
  }).json<{ CartID: string }>()

  return {
    discounts: [],
    id: response.CartID,
    items: options?.cartItems || [],
    prices: {
      orderTotal: 0,
      retailDeliveryFee: 0,
      shipping: 0,
      subtotal: 0,
      subtotalAfterSavings: 0,
      tax: 0,
    },
  }
}

export const CART_QUERY_KEY = ['cart']

export const useCartQuery = () => {
  const { data: session } = useSession()
  const { shippingState } = useShippingStateStore()

  const options = {
    isLoggedIn: !!session?.user.tokenDetails?.accessToken,
    provinceId: shippingState?.provinceID,
  }

  return useQuery({
    cacheTime: Infinity,
    meta: {
      persist: true,
    },
    queryFn: () => createCart(options),
    queryKey: CART_QUERY_KEY,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
