import { create } from 'zustand'

// Define the store state interface
interface CheckoutStoreState {
  isAddressFormOpened: boolean
  isPaymentFormOpened: boolean
}

// Define the store actions interface
interface CheckoutStoreActions {
  setAddressForm: (isEnabled: boolean) => void
  setPaymentForm: (isEnabled: boolean) => void
}

// Combine state and actions into one type
type CheckoutStore = CheckoutStoreState & CheckoutStoreActions

// Create the Zustand store
export const useCheckoutStore = create<CheckoutStore>(set => ({
  isAddressFormOpened: false, // initial state
  isPaymentFormOpened: false, // initial state
  // Actions

  setAddressForm: (isEnabled: boolean) => set({ isAddressFormOpened: isEnabled }),
  setPaymentForm: (isEnabled: boolean) => set({ isPaymentFormOpened: isEnabled }),
}))
