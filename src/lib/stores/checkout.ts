import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GiftMessage {
  message: string
  recipientEmail: string
}

type AccountDetails = Partial<{
  dateOfBirth?: Date
  email: string
  fullName: string
  giftMessage?: GiftMessage
  isLoading: boolean
}>

interface CheckoutStoreState {
  accountDetails?: AccountDetails
}

interface CheckoutStoreActions {
  setAccountDetails: (accountDetails: Partial<AccountDetails>) => void
}

export type CheckoutStore = CheckoutStoreState & CheckoutStoreActions

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    set => ({
      setAccountDetails: (accountDetails: Partial<AccountDetails>) =>
        set(state => ({
          ...state,
          accountDetails: {
            ...state.accountDetails,
            ...accountDetails,
          },
        })),
    }),
    {
      name: 'checkout',
    }
  )
)
