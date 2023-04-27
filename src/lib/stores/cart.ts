import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart } from '../types'

import { Setter } from './types'

interface CartStoreState extends Cart {
  quantity: number
}

interface CartStoreActions {
  setItems: Setter<Cart['items']>
}

type CartStore = CartStoreState & { actions: CartStoreActions }

const initialValues: CartStoreState = {
  discounts: [],
  id: '',
  isSharedCart: false,
  items: [],
  orderDisplayId: undefined,
  prices: {
    orderTotal: 0,
    retailDeliveryFee: 0,
    shipping: 0,
    subtotal: 0,
    subtotalAfterSavings: 0,
    tax: 0,
  },
  quantity: 0,
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialValues,
      actions: {
        setItems: update =>
          typeof update === 'function'
            ? set(state => ({ items: update(state.items) }))
            : set(() => ({ items: update })),
      },
      quantity: get()?.items?.reduce((prev, current) => current.quantity + prev, 0),
    }),
    { name: 'cart' }
  )
)

export const useCartItems = () => {
  const selector = useCallback((state: CartStore) => ({ items: state.items }), [])
  return useCartStore(selector)
}

export const useCartActions = () => {
  const selector = useCallback((state: CartStore) => ({ ...state.actions }), [])
  return useCartStore(selector)
}
