import { useMemo } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import {
  ADDRESS_CREDIT_CARDS_QUERY_KEY,
  ShippingAddressesAndCreditCards,
  getShippingAddressesAndCreditCards,
} from '@/lib/queries/checkout/addreses-and-credit-cards'
import { GET_SUBTOTAL_QUERY } from '@/lib/queries/checkout/get-subtotal'
import { SHIPPING_METHODS_QUERY_KEY } from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'

export const APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY = ['apply-checkout-selections']

export interface ApplyCheckoutSelectionsOptions {
  addressId: number
  cartId?: string
  paymentToken?: string
  userDisplayId?: string
}

type Response = { Success: true } | Failure
export const applyCheckoutSelections = async ({
  addressId,
  cartId,
  paymentToken,
  userDisplayId,
}: ApplyCheckoutSelectionsOptions) => {
  try {
    const response = await api('v2/checkout/ApplyCheckoutSelections', {
      json: {
        addressId,
        billingOption: '2',
        paymentMethodID: 1,
        paymentToken,
        personDisplayId: userDisplayId || '',
        personTypeId: 2,
        shippingOption: 2,
      },
      method: 'post',
      searchParams: { cartId: cartId || '' },
    }).json<Response>()

    if (!response.Success) {
      throw new Error(response.Error.Message)
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useApplyCheckoutSelectionsMutation = () => {
  const queryClient = useQueryClient()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const guestAddress = useCheckoutGuestAddress()
  const { setActiveCreditCard, setActiveShippingAddress } = useCheckoutActions()
  const address = useMemo(
    () => (session?.user?.isGuest ? guestAddress : activeShippingAddress),
    [activeShippingAddress, guestAddress, session?.user?.isGuest]
  )

  return useMutation<Response, Error, Partial<ApplyCheckoutSelectionsOptions>>({
    mutationFn: data =>
      applyCheckoutSelections({
        ...data,
        addressId: data.addressId || address?.AddressID || 0,
        cartId: data.cartId || cart?.id,
        paymentToken: data.paymentToken || activeCreditCard?.PaymentToken,
        userDisplayId: data.userDisplayId || session?.user?.displayId,
      }),
    mutationKey: [...APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY],
    onSuccess: async (response, data) => {
      if (response.Success) {
        const { addresses, creditCards } =
          await queryClient.ensureQueryData<ShippingAddressesAndCreditCards>({
            queryFn: getShippingAddressesAndCreditCards,
            queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, session?.user?.isGuest],
          })
        let correspondingAddress = addresses.find(address => address.AddressID === data.addressId)
        let correspondingCreditCard = creditCards.find(
          creditCard => creditCard.PaymentToken === data.paymentToken
        )
        if (correspondingAddress === undefined || correspondingCreditCard === undefined) {
          const { addresses: altAddresses, creditCards: altCreditCards } =
            await queryClient.ensureQueryData<ShippingAddressesAndCreditCards>({
              queryFn: getShippingAddressesAndCreditCards,
              queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, session?.user?.isGuest],
            })
          correspondingAddress = altAddresses.find(address => address.AddressID === data.addressId)
          correspondingCreditCard = altCreditCards.find(
            creditCard => creditCard.PaymentToken === data.paymentToken
          )
        }
        setActiveShippingAddress(correspondingAddress)
        setActiveCreditCard(correspondingCreditCard)
      }
      await queryClient.invalidateQueries([GET_SUBTOTAL_QUERY, cart?.id])
      await queryClient.invalidateQueries({
        queryKey: [SHIPPING_METHODS_QUERY_KEY],
      })
    },
  })
}
