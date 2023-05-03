import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Address } from '../types/address'
import { ShippingMethod } from '../types/shipping-method'

import { Setter } from './types'

interface GiftMessage {
  message: string
  recipientEmail: string
}

interface ContactInformation {
  dateOfBirth?: Date
  email: string
  fullName: string
  isLoading: boolean
}

export type CheckoutTab = 'contact-information' | 'delivery' | 'payment'

interface CheckoutStoreState {
  activeShippingAddress?: Address
  activeTab: CheckoutTab
  completedTabs: CheckoutTab[]
  contactInformation: ContactInformation
  giftMessage: GiftMessage
  shippingMethod?: ShippingMethod
}

interface CheckoutStoreActions {
  resetContactInformation: () => void
  resetGiftMessage: () => void
  setContactInformation: Setter<ContactInformation>
  setActiveTab: (tab: CheckoutTab) => void
  setActiveShippingAddress: (address: Address | undefined) => void
  setCompletedTabs: Setter<CheckoutTab[]>
  setGiftMessage: Setter<GiftMessage>
  setShippingMethod: (shippingMethod: ShippingMethod | undefined) => void
}

export type CheckoutStore = CheckoutStoreState & { actions: CheckoutStoreActions }

const initialValues: CheckoutStoreState = {
  activeTab: 'delivery',
  completedTabs: [],
  contactInformation: {
    dateOfBirth: undefined,
    email: '',
    fullName: '',
    isLoading: true,
  },
  giftMessage: {
    message: '',
    recipientEmail: '',
  },
}

const useCheckoutStore = create<CheckoutStore>()(
  persist(
    set => ({
      ...initialValues,
      actions: {
        resetContactInformation: () =>
          set(() => ({ contactInformation: initialValues.contactInformation })),
        resetGiftMessage: () => set(() => ({ giftMessage: initialValues.giftMessage })),
        setActiveShippingAddress: activeShippingAddress => set(() => ({ activeShippingAddress })),
        setActiveTab: activeTab => set(() => ({ activeTab })),
        setCompletedTabs: update =>
          typeof update === 'function'
            ? set(state => ({ completedTabs: update(state.completedTabs) }))
            : set(() => ({ completedTabs: update })),
        setContactInformation: update =>
          typeof update === 'function'
            ? set(state => ({ contactInformation: update(state.contactInformation) }))
            : set(() => ({ contactInformation: update })),
        setGiftMessage: update =>
          typeof update === 'function'
            ? set(state => ({ giftMessage: update(state.giftMessage) }))
            : set(() => ({ giftMessage: update })),
        setShippingMethod: shippingMethod => set(() => ({ shippingMethod })),
      },
    }),
    {
      name: 'checkout',
      partialize: ({ giftMessage }) => ({ giftMessage }),
    }
  )
)

export const useCheckoutActiveShippingAddress = () => {
  const selector = useCallback(
    ({ activeShippingAddress }: CheckoutStore) => ({ activeShippingAddress }),
    []
  )
  return useCheckoutStore(selector)
}

export const useCheckoutShippingMethod = () => {
  const selector = useCallback(({ shippingMethod }: CheckoutStore) => ({ shippingMethod }), [])
  return useCheckoutStore(selector)
}

export const useCheckoutTabs = () => {
  const selector = useCallback(
    (state: CheckoutStore) => ({ activeTab: state.activeTab, completedTabs: state.completedTabs }),
    []
  )
  return useCheckoutStore(selector)
}

export const useCheckoutContactInformation = () => {
  const selector = useCallback((state: CheckoutStore) => state.contactInformation, [])
  return useCheckoutStore(selector)
}

export const useCheckoutGiftMessage = () => {
  const selector = useCallback((state: CheckoutStore) => state.giftMessage, [])
  return useCheckoutStore(selector)
}

export const useCheckoutActions = () => {
  const selector = useCallback((state: CheckoutStore) => state.actions, [])
  return useCheckoutStore(selector)
}
