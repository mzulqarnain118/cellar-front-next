import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { State } from '../types'

interface ShippingStateStore {
  shippingState?: State
  setShippingState: (shippingState?: State) => void
}

export const useShippingStateStore = create<ShippingStateStore>()(
  persist(
    set => ({
      setShippingState: (shippingState?: State) => set({ shippingState }),
      shippingState: undefined,
    }),
    {
      name: 'shipping-state',
    }
  )
)
