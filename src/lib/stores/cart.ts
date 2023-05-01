import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart, CartItem } from '../types'

import { Setter } from './types'

interface CartStoreState extends Cart {
  quantity: number
}

interface CartStoreActions {
  addToCart: (item: CartItem) => void
  removeFromCart: (item: CartItem | string) => void
  setCart: (cart: Cart) => void
  setItems: Setter<Cart['items']>
  updateQuantity: (product: CartItem | string, quantity: number) => void
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
        addToCart: (item: CartItem) => set(({ items }) => ({ items: [...items, item] })),
        quantity: get()?.items?.reduce((prev, current) => current.quantity + prev, 0),
        removeFromCart: product =>
          set(({ items }) => ({
            items: items.filter(
              item =>
                item.sku.toLowerCase() !==
                (typeof product === 'string' ? product.toLowerCase() : product.sku.toLowerCase())
            ),
          })),
        setCart: cart => set(() => ({ ...cart })),
        setItems: update =>
          typeof update === 'function'
            ? set(state => ({ items: update(state.items) }))
            : set(() => ({ items: update })),
        updateQuantity: (product, quantity) => {
          const { items } = get()
          const correspondingProduct = items.find(
            item =>
              item.sku.toLowerCase() ===
              (typeof product === 'string' ? product.toLowerCase() : product.sku.toLowerCase())
          )

          if (correspondingProduct !== undefined) {
            const filteredProducts = items.filter(
              item => item.sku !== correspondingProduct.sku.toLowerCase()
            )
            set(() => ({
              items: [...filteredProducts, { ...correspondingProduct, quantity }],
            }))
          }
        },
      },
    }),
    { name: 'cart' }
  )
)

export const useCart = () => {
  const selector = useCallback((state: CartStore) => state, [])
  return useCartStore(selector)
}

export const useCartQuantity = () => {
  const selector = useCallback((state: CartStore) => state.quantity, [])
  return useCartStore(selector)
}

export const useCartItems = () => {
  const selector = useCallback((state: CartStore) => ({ items: state.items }), [])
  return useCartStore(selector)
}

export const useCartActions = () => {
  const selector = useCallback((state: CartStore) => ({ ...state.actions }), [])
  return useCartStore(selector)
}
