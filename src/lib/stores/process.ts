import { useCallback } from 'react'

import { create } from 'zustand'

import { Setter } from './types'

interface Error {
  message: string
}

interface ProcessStore {
  cartOpen: boolean
  error?: Error
  isLoading: boolean
  isMutatingCart: boolean
  setError: (error: Error | undefined) => void
  setIsLoading: Setter<boolean>
  setIsMutatingCart: (isMutatingCart: boolean) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
  toggleCartOpen: () => void
}

export const useProcessStore = create<ProcessStore>(set => ({
  cartOpen: false,
  isLoading: false,
  isMutatingCart: false,
  setError: (error: Error | undefined) => set({ error }),
  setIsLoading: update =>
    typeof update === 'function'
      ? set(({ isLoading }) => ({ isLoading: update(isLoading) }))
      : set(() => ({ isLoading: update })),
  setIsMutatingCart: (isMutatingCart: boolean) => set({ isMutatingCart }),
  setShaderVisible: (shaderVisible: boolean) => set({ shaderVisible }),
  shaderVisible: false,
  toggleCartOpen: () => set(state => ({ cartOpen: !state.cartOpen })),
}))

export const useCartOpen = () => {
  const selector = useCallback(
    (state: ProcessStore) => ({ cartOpen: state.cartOpen, toggleCartOpen: state.toggleCartOpen }),
    []
  )

  return useProcessStore(selector)
}

export const useIsLoading = () => {
  const selector = useCallback(({ isLoading }: ProcessStore) => isLoading, [])
  return useProcessStore(selector)
}
