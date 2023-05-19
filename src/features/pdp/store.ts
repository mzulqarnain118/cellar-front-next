import { useCallback } from 'react'

import { create } from 'zustand'

import { Setter } from '@/lib/stores/types'
import { CartItem, SubscriptionProduct } from '@/lib/types'

export type Option = 'subscription' | 'one-time'

interface PdpStoreState {
  selectedOption: Option
  selectedProduct?: SubscriptionProduct | CartItem
}

interface PdpStoreActions {
  setSelectedOption: Setter<Option>
  setSelectedProduct: Setter<SubscriptionProduct | CartItem | undefined>
}

type PdpStore = PdpStoreState & { actions: PdpStoreActions }

export const usePdpStore = create<PdpStore>()(set => ({
  actions: {
    setSelectedOption: update =>
      typeof update === 'function'
        ? set(({ selectedOption }) => ({ selectedOption: update(selectedOption) }))
        : set(() => ({ selectedOption: update })),
    setSelectedProduct: update =>
      typeof update === 'function'
        ? set(({ selectedProduct }) => ({ selectedProduct: update(selectedProduct) }))
        : set(() => ({ selectedProduct: update })),
  },
  selectedOption: 'one-time',
}))

export const usePdpActions = () => {
  const selector = useCallback(({ actions }: PdpStore) => actions, [])
  return usePdpStore(selector)
}

export const usePdpSelectedOption = () => {
  const selector = useCallback(({ selectedOption }: PdpStore) => selectedOption, [])
  return usePdpStore(selector)
}

export const usePdpSelectedProduct = () => {
  const selector = useCallback(({ selectedProduct }: PdpStore) => selectedProduct, [])
  return usePdpStore(selector)
}
