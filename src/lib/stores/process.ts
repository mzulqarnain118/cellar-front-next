import { create } from 'zustand'

interface Error {
  message: string
}

interface ProcessStore {
  cartTriggerRef?: HTMLLabelElement
  error?: Error
  isMutatingCart: boolean
  setCartTriggerRef: (ref: HTMLLabelElement) => void
  setError: (error: Error | undefined) => void
  setIsMutatingCart: (isMutatingCart: boolean) => void
  setShaderVisible: (shaderVisible: boolean) => void
  shaderVisible: boolean
  toggleCartOpen: () => void
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  isMutatingCart: false,
  setCartTriggerRef: ref => set({ cartTriggerRef: ref }),
  setError: (error: Error | undefined) => set({ error }),
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
