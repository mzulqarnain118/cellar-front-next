import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import {
  ADDRESS_CREDIT_CARDS_QUERY_KEY,
  ShippingAddressesAndCreditCards,
  getShippingAddressesAndCreditCards,
} from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useCheckoutActions } from '@/lib/stores/checkout'
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
    return response
  } catch {
    throw new Error('')
  }
}

export const useApplyCheckoutSelectionsMutation = () => {
  const queryClient = useQueryClient()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const { setActiveShippingAddress } = useCheckoutActions()

  return useMutation<Response, Error, ApplyCheckoutSelectionsOptions>({
    mutationFn: data =>
      applyCheckoutSelections({
        ...data,
        cartId: data.cartId || cart?.id,
        userDisplayId: data.userDisplayId || session?.user.displayId,
      }),
    mutationKey: [...APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY],
    onSuccess: async (response, data) => {
      if (response.Success) {
        const { addresses } = await queryClient.ensureQueryData<ShippingAddressesAndCreditCards>({
          queryFn: getShippingAddressesAndCreditCards,
          queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, null],
        })
        let correspondingAddress = addresses.find(address => address.AddressID === data.addressId)
        if (correspondingAddress === undefined) {
          const { addresses: altAddresses } =
            await queryClient.ensureQueryData<ShippingAddressesAndCreditCards>({
              queryFn: getShippingAddressesAndCreditCards,
              queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, data.addressId],
            })
          correspondingAddress = altAddresses.find(address => address.AddressID === data.addressId)
        }
        setActiveShippingAddress(correspondingAddress)
      }
    },
  })
}
