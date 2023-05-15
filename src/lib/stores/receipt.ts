import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart } from '../types'

import { Setter } from './types'

export interface Receipt {
  cartItems: Cart['items']
  deliveryMethodDisplayName: string
  prices: {
    shipping: number
    salesTax: number
    subtotal: number
    retailDeliveryFee: number
    subtotalAfterSavings: number
    appliedSkyWallet: number
  }
  discounts: Cart['discounts']
  deliveryAddress: {
    company?: string
    firstName?: string
    lastName?: string
    addressLineOne?: string
    addressLineTwo?: string
    city?: string
    state?: string
    zipCode?: string
  }
  orderDisplayId?: string
  consultantDisplayId?: string
  consultantName?: string
  isSharedCart: boolean
}

const initialValues: Receipt = {
  cartItems: [],
  deliveryAddress: {
    addressLineOne: '',
    addressLineTwo: '',
    city: '',
    company: '',
    firstName: '',
    lastName: '',
    state: '',
    zipCode: '',
  },
  deliveryMethodDisplayName: '',
  discounts: [],
  isSharedCart: false,
  prices: {
    appliedSkyWallet: 0,
    retailDeliveryFee: 0,
    salesTax: 0,
    shipping: 0,
    subtotal: 0,
    subtotalAfterSavings: 0,
  },
}

interface ReceiptActions {
  reset: () => void
  setReceipt: Setter<Receipt>
}

export type ReceiptStore = Receipt & { actions: ReceiptActions }

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    set => ({
      ...initialValues,
      actions: {
        reset: () => {
          set(({ actions }) => ({ ...actions, ...initialValues }))
        },
        setReceipt: update =>
          typeof update === 'function'
            ? set(prev => ({ ...update(prev) }))
            : set(() => ({ ...update })),
      },
    }),
    {
      name: 'receipt',
      partialize: ({ actions: _, ...rest }) => ({ ...rest }),
    }
  )
)

export const useReceiptActions = () => {
  const selector = useCallback(({ actions }: ReceiptStore) => actions, [])
  return useReceiptStore(selector)
}

export const useReceiptData = () => {
  const selector = useCallback(
    ({
      cartItems,
      deliveryAddress,
      deliveryMethodDisplayName,
      discounts,
      isSharedCart,
      prices,
      consultantDisplayId,
      consultantName,
      orderDisplayId,
    }: ReceiptStore) => ({
      cartItems,
      consultantDisplayId,
      consultantName,
      deliveryAddress,
      deliveryMethodDisplayName,
      discounts,
      isSharedCart,
      orderDisplayId,
      prices,
    }),
    []
  )
  return useReceiptStore(selector)
}
