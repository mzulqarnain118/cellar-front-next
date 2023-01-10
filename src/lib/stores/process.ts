import create from 'zustand'

interface ProcessStore {
  cartOpen: boolean
  setCartOpen: (cartOpen: boolean) => void
}

export const useProcessStore = create<ProcessStore>(set => ({
  cartOpen: false,
  setCartOpen: (cartOpen: boolean) => set({ cartOpen }),
}))
