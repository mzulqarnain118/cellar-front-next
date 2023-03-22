import { create } from 'zustand'

interface ProcessStore {
  cartTriggerRef?: HTMLLabelElement
  isMutatingCart: boolean
  setCartTriggerRef: (ref: HTMLLabelElement) => void
  setIsMutatingCart: (isMutatingCart: boolean) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
  toggleCartOpen: () => void
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  isMutatingCart: false,
  setCartTriggerRef: ref => set({ cartTriggerRef: ref }),
  setIsMutatingCart: (isMutatingCart: boolean) => set({ isMutatingCart }),
  setShaderVisible: (shaderVisible: boolean) => set({ shaderVisible }),
  shaderVisible: false,
  toggleCartOpen: () => {
    const ref = get().cartTriggerRef
    if (ref !== undefined) {
      ref.click()
    }
  },
}))
