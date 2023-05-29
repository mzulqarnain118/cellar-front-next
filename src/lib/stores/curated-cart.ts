import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CuratedCart } from '../types'

import { Setter } from './types'

interface CuratedCartStore {
  curatedCart?: CuratedCart
  dismissCart: () => void
  reset: () => void
  setCuratedCart: Setter<CuratedCart | undefined>
}

export const useCuratedCartStore = create<CuratedCartStore>()(
  persist(
    set => ({
      curatedCart: undefined,
      dismissCart: () =>
        set(prev => ({
          ...prev,
          curatedCart:
            prev.curatedCart !== undefined
              ? { ...prev.curatedCart, cartAccepted: false, messageDismissed: true }
              : {
                  cartAccepted: false,
                  cartId: '',
                  messageDismissed: false,
                  recommendedByPersonDisplayId: '',
                },
        })),
      reset: () =>
        set(prev => ({
          ...prev,
          curatedCart: undefined,
        })),
      setCuratedCart: update =>
        typeof update === 'function'
          ? set(({ curatedCart }) => ({ curatedCart: update(curatedCart) }))
          : set(() => ({ curatedCart: update })),
    }),
    { name: 'curated-cart' }
  )
)
