import { useCallback } from 'react'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Cart } from '../types'
import { Address } from '../types/address'
import { CreditCard } from '../types/credit-card'

import { Setter } from './types'

interface GiftMessage {
  message: string
  recipientEmail: string
}

interface ContactInformation {
  dateOfBirth?: Date
  email: string
  fullName: string
  isLoading: boolean
}

interface Code {
  codes: string[]
  isAdded: boolean
}

interface Errors {
  autoSipTerms?: string
  contactInformation?: string
  delivery?: string
  payment?: {
    cvv?: string
    form?: string
    giftCardCode?: string
    promoCode?: string
  }
  terms?: string
  wineClubTerms?: string
}

type PickUpOption = 'abc' | 'hal' | 'lpu'

interface CheckoutStoreState {
  activeCreditCard?: CreditCard
  activeShippingAddress?: Address
  appliedSkyWallet: number
  contactInformation: ContactInformation
  cvv: string
  errors?: Errors
  giftCardCode: Code
  giftMessage: GiftMessage
  guestAddress?: Address
  guestCreditCard?: CreditCard
  isAddingAddress: boolean
  isAddingCreditCard: boolean
  isAddingGiftMessage: boolean
  isGift: boolean
  isPickUp: boolean
  promoCode: Code
  removedCartItems: Cart['items']
  selectedPickUpAddress?: Address
  selectedPickUpOption?: PickUpOption
}

interface CheckoutStoreActions {
  reset: () => void
  resetContactInformation: () => void
  resetGiftMessage: () => void
  setActiveCreditCard: (creditCard: CreditCard | undefined) => void
  setActiveShippingAddress: (address: Address | undefined) => void
  setAppliedSkyWallet: Setter<number>
  setContactInformation: Setter<ContactInformation>
  setCvv: Setter<string | undefined>
  setErrors: Setter<Errors | undefined>
  setGiftCardCode: Setter<Code>
  setGiftMessage: Setter<GiftMessage>
  setGuestAddress: (address: Address | undefined) => void
  setGuestCreditCard: (creditCard: CreditCard | undefined) => void
  setIsAddingAddress: Setter<boolean>
  setIsAddingCreditCard: Setter<boolean>
  setIsAddingGiftMessage: Setter<boolean>
  setIsGift: Setter<boolean>
  setIsPickUp: Setter<boolean>
  setPromoCode: Setter<Code>
  setRemovedCartItems: Setter<Cart['items'] | undefined>
  setSelectedPickUpAddress: Setter<Address | undefined>
  setSelectedPickUpOption: Setter<PickUpOption | undefined>
  toggleIsAddingGiftMessage: () => void
}

export type CheckoutStore = CheckoutStoreState & { actions: CheckoutStoreActions }

const initialValues: CheckoutStoreState = {
  appliedSkyWallet: 0,
  contactInformation: {
    dateOfBirth: undefined,
    email: '',
    fullName: '',
    isLoading: true,
  },
  cvv: '',
  giftCardCode: {
    codes: [],
    isAdded: false,
  },
  giftMessage: {
    message: '',
    recipientEmail: '',
  },
  guestAddress: undefined,
  guestCreditCard: undefined,
  isAddingAddress: false,
  isAddingCreditCard: false,
  isAddingGiftMessage: false,
  isGift: false,
  isPickUp: false,
  promoCode: {
    codes: [],
    isAdded: false,
  },
  removedCartItems: [],
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    set => ({
      ...initialValues,
      actions: {
        reset: () => {
          set(({ actions }) => ({ ...actions, ...initialValues }))
        },
        resetContactInformation: () =>
          set(() => ({ contactInformation: initialValues.contactInformation })),
        resetGiftMessage: () => set(() => ({ giftMessage: initialValues.giftMessage })),
        setActiveCreditCard: activeCreditCard => set(() => ({ activeCreditCard })),
        setActiveShippingAddress: activeShippingAddress => set(() => ({ activeShippingAddress })),
        setAppliedSkyWallet: update =>
          typeof update === 'function'
            ? set(({ appliedSkyWallet }) => ({ appliedSkyWallet }))
            : set(() => ({ appliedSkyWallet: update })),
        setContactInformation: update =>
          typeof update === 'function'
            ? set(({ contactInformation }) => ({ contactInformation: update(contactInformation) }))
            : set(() => ({ contactInformation: update })),
        setCvv: update =>
          typeof update === 'function'
            ? set(({ cvv }) => ({ cvv: update(cvv) }))
            : set(() => ({ cvv: update })),
        setErrors: update =>
          typeof update === 'function'
            ? set(({ errors }) => ({ errors: update(errors) }))
            : set(() => ({ errors: update })),
        setGiftCardCode: update =>
          typeof update === 'function'
            ? set(({ giftCardCode }) => ({ giftCardCode: update(giftCardCode) }))
            : set(() => ({ giftCardCode: update })),
        setGiftMessage: update =>
          typeof update === 'function'
            ? set(({ giftMessage }) => ({ giftMessage: update(giftMessage) }))
            : set(() => ({ giftMessage: update })),
        setGuestAddress: guestAddress => set(() => ({ guestAddress })),
        setGuestCreditCard: guestCreditCard => set(() => ({ guestCreditCard })),
        setIsAddingAddress: update =>
          typeof update === 'function'
            ? set(({ isAddingAddress }) => ({ isAddingAddress: update(isAddingAddress) }))
            : set(() => ({ isAddingAddress: update })),
        setIsAddingCreditCard: update =>
          typeof update === 'function'
            ? set(({ isAddingCreditCard }) => ({ isAddingCreditCard: update(isAddingCreditCard) }))
            : set(() => ({ isAddingCreditCard: update })),
        setIsAddingGiftMessage: update =>
          typeof update === 'function'
            ? set(({ isAddingGiftMessage }) => ({
                isAddingGiftMessage: update(isAddingGiftMessage),
              }))
            : set(() => ({ isAddingGiftMessage: update })),
        setIsGift: update =>
          typeof update === 'function'
            ? set(({ isGift }) => ({ isGift: update(isGift) }))
            : set(() => ({ isGift: update })),
        setIsPickUp: update =>
          typeof update === 'function'
            ? set(({ isPickUp }) => ({ isPickUp: update(isPickUp) }))
            : set(() => ({ isPickUp: update })),
        setPromoCode: update =>
          typeof update === 'function'
            ? set(({ promoCode }) => ({ promoCode: update(promoCode) }))
            : set(() => ({ promoCode: update })),
        setRemovedCartItems: update =>
          typeof update === 'function'
            ? set(({ removedCartItems }) => ({ removedCartItems: update(removedCartItems) }))
            : set(() => ({ removedCartItems: update })),
        setSelectedPickUpAddress: update =>
          typeof update === 'function'
            ? set(({ selectedPickUpAddress }) => ({
                selectedPickUpAddress: update(selectedPickUpAddress),
              }))
            : set(() => ({ selectedPickUpAddress: update })),
        setSelectedPickUpOption: update =>
          typeof update === 'function'
            ? set(({ selectedPickUpOption }) => ({
                selectedPickUpOption: update(selectedPickUpOption),
              }))
            : set(() => ({ selectedPickUpOption: update })),
        toggleIsAddingGiftMessage: () =>
          set(({ isAddingGiftMessage }) => ({ isAddingGiftMessage: !isAddingGiftMessage })),
      },
    }),
    {
      name: 'checkout',
      partialize: ({ appliedSkyWallet, giftCardCode, giftMessage, guestAddress, promoCode }) => ({
        appliedSkyWallet,
        giftCardCode,
        giftMessage,
        guestAddress,
        promoCode,
      }),
    }
  )
)

export const useCheckoutActiveShippingAddress = () => {
  const selector = useCallback(
    ({ activeShippingAddress }: CheckoutStore) => ({ activeShippingAddress }),
    []
  )
  return useCheckoutStore(selector).activeShippingAddress
}

export const useCheckoutActiveCreditCard = () => {
  const selector = useCallback(({ activeCreditCard }: CheckoutStore) => ({ activeCreditCard }), [])
  return useCheckoutStore(selector).activeCreditCard
}

export const useCheckoutAppliedSkyWallet = () => {
  const selector = useCallback(({ appliedSkyWallet }: CheckoutStore) => ({ appliedSkyWallet }), [])
  return useCheckoutStore(selector).appliedSkyWallet
}

export const useCheckoutContactInformation = () => {
  const selector = useCallback(({ contactInformation }: CheckoutStore) => contactInformation, [])
  return useCheckoutStore(selector)
}

export const useCheckoutCvv = () => {
  const selector = useCallback(({ cvv }: CheckoutStore) => cvv, [])
  return useCheckoutStore(selector)
}

export const useCheckoutErrors = () => {
  const selector = useCallback(({ errors }: CheckoutStore) => errors, [])
  return useCheckoutStore(selector)
}

export const useCheckoutGiftCardCode = () => {
  const selector = useCallback(({ giftCardCode }: CheckoutStore) => giftCardCode, [])
  return useCheckoutStore(selector)
}

export const useCheckoutGiftMessage = () => {
  const selector = useCallback(({ giftMessage }: CheckoutStore) => giftMessage, [])
  return useCheckoutStore(selector)
}

export const useCheckoutGuestAddress = () => {
  const selector = useCallback(({ guestAddress }: CheckoutStore) => guestAddress, [])
  return useCheckoutStore(selector)
}

export const useCheckoutGuestCreditCard = () => {
  const selector = useCallback(({ guestCreditCard }: CheckoutStore) => guestCreditCard, [])
  return useCheckoutStore(selector)
}

export const useCheckoutIsAddingAddress = () => {
  const selector = useCallback(({ isAddingAddress }: CheckoutStore) => isAddingAddress, [])
  return useCheckoutStore(selector)
}

export const useCheckoutIsAddingCreditCard = () => {
  const selector = useCallback(({ isAddingCreditCard }: CheckoutStore) => isAddingCreditCard, [])
  return useCheckoutStore(selector)
}

export const useCheckoutIsAddingGiftMessage = () => {
  const selector = useCallback(({ isAddingGiftMessage }: CheckoutStore) => isAddingGiftMessage, [])
  return useCheckoutStore(selector)
}

export const useCheckoutIsGift = () => {
  const selector = useCallback(({ isGift }: CheckoutStore) => isGift, [])
  return useCheckoutStore(selector)
}

export const useCheckoutIsPickUp = () => {
  const selector = useCallback(({ isPickUp }: CheckoutStore) => isPickUp, [])
  return useCheckoutStore(selector)
}

export const useCheckoutPromoCode = () => {
  const selector = useCallback(({ promoCode }: CheckoutStore) => promoCode, [])
  return useCheckoutStore(selector)
}

export const useCheckoutRemovedCartItems = () => {
  const selector = useCallback(({ removedCartItems }: CheckoutStore) => removedCartItems, [])
  return useCheckoutStore(selector)
}

export const useCheckoutSelectedPickUpAddress = () => {
  const selector = useCallback(
    ({ selectedPickUpAddress }: CheckoutStore) => selectedPickUpAddress,
    []
  )
  return useCheckoutStore(selector)
}

export const useCheckoutSelectedPickUpOption = () => {
  const selector = useCallback(
    ({ selectedPickUpOption }: CheckoutStore) => selectedPickUpOption,
    []
  )
  return useCheckoutStore(selector)
}

export const useCheckoutActions = () => {
  const selector = useCallback(({ actions }: CheckoutStore) => actions, [])
  return useCheckoutStore(selector)
}
