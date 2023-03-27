import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { State } from '../types'

interface ShippingStateStore {
  shippingState: State
  setShippingState: (shippingState?: State) => void
}

export const DEFAULT_SHIPPING_STATE: State = {
  abbreviation: 'TX',
  countryID: 1,
  enabled: true,
  name: 'Texas',
  provinceID: 48,
}

export const useShippingStateStore = create<ShippingStateStore>()(
  persist(
    set => ({
      setShippingState: (shippingState?: State) => set({ shippingState }),
      shippingState: DEFAULT_SHIPPING_STATE,
    }),
    {
      name: 'shipping-state',
    }
  )
)
