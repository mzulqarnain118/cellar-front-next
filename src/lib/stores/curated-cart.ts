import create from 'zustand'
import { persist } from 'zustand/middleware'

import { CuratedCart } from '../types'

interface CuratedCartStore {
  curatedCart?: CuratedCart
  setCuratedCart: (curatedCart?: CuratedCart) => void
}

export const useCuratedCartStore = create<CuratedCartStore>()(
  persist(
    set => ({
      curatedCart: undefined,
      setCuratedCart: (curatedCart?: CuratedCart) => set({ curatedCart }),
    }),
    { name: 'curated-cart' }
  )
)
