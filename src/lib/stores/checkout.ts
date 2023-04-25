import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Setter } from './types'

interface GiftMessage {
  message: string
  recipientEmail: string
}

interface AccountDetails {
  dateOfBirth?: Date
  email: string
  fullName: string
  isLoading: boolean
}

export type CheckoutTab = 'delivery' | 'shipping' | 'payment'

interface CheckoutStoreState {
  accountDetails: AccountDetails
  giftMessage: GiftMessage
  activeTab: CheckoutTab
  completedTabs: CheckoutTab[]
}

interface CheckoutStoreActions {
  resetAccountDetails: () => void
  resetGiftMessage: () => void
  setAccountDetails: Setter<AccountDetails>
  setActiveTab: (tab: CheckoutTab) => void
  setCompletedTabs: Setter<CheckoutTab[]>
  setGiftMessage: Setter<GiftMessage>
}

export type CheckoutStore = CheckoutStoreState & { actions: CheckoutStoreActions }

const initialValues: CheckoutStoreState = {
  accountDetails: {
    dateOfBirth: undefined,
    email: '',
    fullName: '',
    isLoading: true,
  },
  activeTab: 'delivery',
  completedTabs: [],
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
        resetAccountDetails: () => set(() => ({ accountDetails: initialValues.accountDetails })),
        resetGiftMessage: () => set(() => ({ giftMessage: initialValues.giftMessage })),
        setAccountDetails: update =>
          typeof update === 'function'
            ? set(state => ({ accountDetails: update(state.accountDetails) }))
            : set(() => ({ accountDetails: update })),
        setActiveTab: activeTab => set(() => ({ activeTab })),
        setCompletedTabs: update =>
          typeof update === 'function'
            ? set(state => ({ completedTabs: update(state.completedTabs) }))
            : set(() => ({ completedTabs: update })),
        setGiftMessage: update =>
          typeof update === 'function'
            ? set(state => ({ giftMessage: update(state.giftMessage) }))
            : set(() => ({ giftMessage: update })),
      },
    }),
    {
      name: 'checkout',
      partialize: ({ giftMessage }) => ({ giftMessage }),
    }
  )
)

export const useCheckoutTabs = () => {
  const selector = useCallback(
    (state: CheckoutStore) => ({ activeTab: state.activeTab, completedTabs: state.completedTabs }),
    []
  )
  return useCheckoutStore(selector)
}

export const useCheckoutAccountDetails = () => {
  const selector = useCallback((state: CheckoutStore) => state.accountDetails, [])
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
