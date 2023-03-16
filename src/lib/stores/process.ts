import { create } from 'zustand'

interface ProcessStore {
  cartTriggerRef?: HTMLLabelElement
  setCartTriggerRef: (ref: HTMLLabelElement) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
  toggleCartOpen: () => void
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  setCartTriggerRef: ref => set({ cartTriggerRef: ref }),
  setShaderVisible: (shaderVisible: boolean) => set({ shaderVisible }),
  shaderVisible: false,
  toggleCartOpen: () => {
    const ref = get().cartTriggerRef
    if (ref !== undefined) {
      ref.click()
    }
  },
}))
