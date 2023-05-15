import { useQuery } from '@tanstack/react-query'

import { api } from '../api'
import { useCartStorage } from '../hooks/use-cart-storage'
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
  const { shippingState } = useShippingStateStore()
  const [cartStorage, setCartStorage] = useCartStorage()

  return useQuery({
    cacheTime: Infinity,
    initialData: cartStorage,
    meta: {
      persist: true,
    },
    onSuccess: response => {
      setCartStorage(response)
    },
    queryFn: () => createCart({ provinceId: shippingState?.provinceID }),
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: CART_QUERY_KEY,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}
