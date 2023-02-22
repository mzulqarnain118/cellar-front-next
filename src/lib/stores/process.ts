import { create } from 'zustand'

interface ProcessStore {
  cartOpen: boolean
  setCartOpen: (cartOpen: boolean) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
}

export const useProcessStore = create<ProcessStore>(set => ({
  cartOpen: false,
  setCartOpen: (cartOpen: boolean) => set({ cartOpen }),
  setShaderVisible: (shaderVisible: boolean) => set({ shaderVisible }),
  shaderVisible: false,
}))
