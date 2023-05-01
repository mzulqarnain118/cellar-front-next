import { useCallback } from 'react'

import { create } from 'zustand'

interface Error {
  message: string
}

interface ProcessStore {
  cartOpen: boolean
  error?: Error
  isMutatingCart: boolean
  setError: (error: Error | undefined) => void
  setIsMutatingCart: (isMutatingCart: boolean) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
  toggleCartOpen: () => void
}

export const useProcessStore = create<ProcessStore>(set => ({
  cartOpen: false,
  isMutatingCart: false,
  setError: (error: Error | undefined) => set({ error }),
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
