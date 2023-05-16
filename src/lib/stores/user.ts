import { useCallback } from 'react'

import { create } from 'zustand'

import { User } from '../types'

interface UserStore {
  isExistingCustomer: boolean
  isExistingGuest: boolean
  setIsExistingCustomer: (isExistingCustomer: boolean) => void
  setIsExistingGuest: (isExistingGuest: boolean) => void
  setUser: (fn: (prev: User) => User) => void
  user: User
}

const DEFAULT_USER_STATE: User = {
  displayId: '',
  email: '',
  fullName: '',
  isClubMember: false,
  isGuest: false,
  name: {
    first: '',
    last: '',
  },
  shippingState: {
    abbreviation: 'TX',
    countryID: 1,
    enabled: true,
    name: 'Texas',
    provinceID: 48,
  },
  token: '',
}

export const useUserStore = create<UserStore>()(set => ({
  isExistingCustomer: false,
  isExistingGuest: false,
  setIsExistingCustomer: (isExistingCustomer: boolean) => set({ isExistingCustomer }),
  setIsExistingGuest: (isExistingGuest: boolean) => set({ isExistingGuest }),
  setUser: (fn: (prev: User) => User) => {
    set(state => ({ user: fn(state.user) }))
  },
  user: DEFAULT_USER_STATE,
}))

export const useUserShippingState = () => {
  const selector = useCallback(({ user: { shippingState } }: UserStore) => shippingState, [])
  return useUserStore(selector)
}
