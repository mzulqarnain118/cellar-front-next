import create from 'zustand'

interface GuestStore {
  token?: string
  setToken: (token?: string) => void
}

export const useGuestStore = create<GuestStore>(set => ({
  setToken: (token?: string) => set({ token }),
}))
