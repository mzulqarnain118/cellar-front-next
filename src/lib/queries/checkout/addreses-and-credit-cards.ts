import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import {
  ABC_STORE_SHIPPING_METHOD_ID,
  LOCAL_PICK_UP_SHIPPING_METHOD_ID,
} from '@/lib/constants/shipping-method'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import {
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
} from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'
import { CreditCard } from '@/lib/types/credit-card'

import { useCartQuery } from '../cart'

export const ADDRESS_CREDIT_CARDS_QUERY_KEY = 'addresses-and-credit-cards'

interface GetDetailedUserInformationSuccess {
  Success: true
  Data: {
    addresses: Address[]
    credit_cards: CreditCard[]
    profile: {
      DateOfBirth: string
    }
  }
}

export type GetDetailedUserInformationResponse = GetDetailedUserInformationSuccess | Failure

const DO_NOT_USE = 'DO NOT USE'

export interface ShippingAddressesAndCreditCards {
  addresses: Address[]
  creditCards: CreditCard[]
  primaryAddress?: Address
  primaryCreditCard?: CreditCard
  userDateOfBirth: string
  userPickUpAddresses: {
    Address: Address
    ShippingMethodId: number
  }[]
}

export const getShippingAddressesAndCreditCards: QueryFunction<
  ShippingAddressesAndCreditCards | null
> = async ({ queryKey }) => {
  try {
    const cartId = queryKey[1] as string | null
    const isGuest = queryKey[2] as boolean | null

    if (!cartId || isGuest) {
      return {
        addresses: [],
        creditCards: [],
        userDateOfBirth: '',
        userPickUpAddresses: [],
      }
    }
    const userDetails = await api('v2/user/GetInformationDetailed', {
      searchParams: { cartId },
    }).json<GetDetailedUserInformationResponse>()
    if (userDetails.Success) {
      // const doNotUseAddress = userDetails.Data?.addresses.find(
      //   address => address.Street1 === DO_NOT_USE
      // )
      // setDoNotUseAddress(doNotUseAddress)
      const userPickUpAddresses = userDetails.Data?.addresses
        .filter(address => address.Street3)
        .map(address => {
          const addressThreeData = JSON.parse(address.Street3 || '{}') as { H: string; T: string }
          return {
            Address: address,
            ShippingMethodId:
              addressThreeData.T === 'AL'
                ? ABC_STORE_SHIPPING_METHOD_ID
                : LOCAL_PICK_UP_SHIPPING_METHOD_ID,
          }
        })
      // setPickUpAddresses(userPickUpAddresses)
      const addresses = userDetails.Data?.addresses.filter(
        address => address.Street1 !== DO_NOT_USE && !address.Street3
      )
      const primaryAddress = addresses.find(address => address.Primary) || addresses[0] || undefined
      const creditCards = userDetails.Data?.credit_cards
      const primaryCreditCard =
        creditCards.find(creditCard => creditCard.DefaultPaymentMethod) ||
        creditCards[0] ||
        undefined
      const userDateOfBirth = userDetails.Data?.profile.DateOfBirth

      return {
        addresses,
        creditCards,
        primaryAddress,
        primaryCreditCard,
        userDateOfBirth,
        userPickUpAddresses,
      }
    } else {
      throw new Error(userDetails.Error.Message || '')
    }
  } catch (error) {
    throw new Error('There was an error fetching the addresses and credit cards.')
  }
}

export const useAddressesAndCreditCardsQuery = () => {
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()

  return useQuery({
    enabled: !session?.user?.isGuest,
    onSuccess: data => {
      if (activeShippingAddress === undefined || activeCreditCard === undefined) {
        const address: Address | undefined =
          activeShippingAddress || data?.primaryAddress || data?.addresses[0]
        const creditCard: CreditCard | undefined =
          activeCreditCard || data?.primaryCreditCard || data?.creditCards[0]

        if (address !== undefined) {
          applyCheckoutSelections({
            addressId: address.AddressID,
            paymentToken: creditCard?.PaymentToken,
          })
        }
      }
    },
    queryFn: getShippingAddressesAndCreditCards,
    queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, session?.user?.isGuest],
  })
}
