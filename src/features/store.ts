import { useCallback } from 'react'

import { create } from 'zustand'

import { Setter } from '@/lib/stores/types'

interface CustomerPortalStoreState {
  isLoading: boolean
}

interface CustomerPortalStoreActions {
  setIsLoading: Setter<boolean>
  toggleIsLoading: () => void
}

export interface CustomerPortalStore extends CustomerPortalStoreState {
  actions: CustomerPortalStoreActions
}

export const useCustomerPortalStore = create<CustomerPortalStore>()(set => ({
  actions: {
    setIsLoading: update =>
      typeof update === 'function'
        ? set(({ isLoading }) => ({ isLoading: update(isLoading) }))
        : set(() => ({ isLoading: update })),
    toggleIsLoading: () => set(({ isLoading }) => ({ isLoading: !isLoading })),
  },
  isLoading: false,
}))

export const useCustomerPortalActions = () => {
  const selector = useCallback(({ actions }: CustomerPortalStore) => actions, [])
  return useCustomerPortalStore(selector)
}

export const useCustomerPortalIsLoading = () => {
  const selector = useCallback(({ isLoading }: CustomerPortalStore) => isLoading, [])
  return useCustomerPortalStore(selector)
}
