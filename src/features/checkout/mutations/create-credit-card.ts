import { useMutation, useQueryClient } from '@tanstack/react-query'
import CryptoJS from 'crypto-js'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useCartQuery } from '@/lib/queries/cart'
import { ADDRESS_CREDIT_CARDS_QUERY_KEY } from '@/lib/queries/checkout/addreses-and-credit-cards'
import {
  useCheckoutActions,
  useCheckoutActiveShippingAddress,
  useCheckoutGuestAddress,
  useCheckoutIsPickUp,
} from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'

interface CreatePaymentMethodSuccess {
  Success: true
  Data: {
    PaymentToken: string
    CreditCardTypeID: number
    CreditCardTypeName: string
    NameOnCard: string
    CardNumber: string
    DisplayNumber: string
    ExpirationMonth: string
    ExpirationYear: string
    DefaultPaymentMethod: boolean
    CVV: string | null
    Address: Address
  }
}

type CreatePaymentMethodResponse = CreatePaymentMethodSuccess | Failure

interface CreateCreditCardOptions {
  cartId: string
  address: Address
  creditCard: {
    cvv: string
    expiry: string
    name: string
    number: string
  }
  personDisplayId: string
  setAsDefault?: boolean
}

export const createCreditCard = async ({
  address,
  creditCard,
  cartId,
  personDisplayId,
  setAsDefault = false,
}: CreateCreditCardOptions) => {
  try {
    const expiryDate = creditCard.expiry?.replace(/\s+/g, '').split('/')
    let expirationDate: Date | undefined
    if (expiryDate && expiryDate[0] && expiryDate[1]) {
      expirationDate = new Date(parseInt(`20${expiryDate[1]}`), parseInt(expiryDate[0]) - 1, 15)
    }
    const creditCardPayload = {
      cardNumber: creditCard.number?.replace(/\s+/g, '') || '',
      cvv: creditCard.cvv || '',
      expirationDate: expirationDate || new Date(),
      name: creditCard.name || '',
      setAsDefault,
    }

    const response = await api('v2/checkout/CreatePaymentMethods', {
      json: {
        PaymentMethodsInformation: {
          Address: {
            City: address.City,
            CountryID: 1,
            CountryName: 'United States',
            CountryTwoLetterISO: 'US',
            FirstName: address.FirstName,
            LastName: address.LastName,
            PersonDisplayID: personDisplayId,
            PostalCode: address.PostalCode,
            ProvinceID: address.ProvinceID,
            Street1: address.Street1,
            Street2: address.Street2,
          },
          CVV: CryptoJS.AES.encrypt(
            creditCardPayload.cvv,
            process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || ''
          ).toString(),
          CardNumber: CryptoJS.AES.encrypt(
            creditCardPayload.cardNumber,
            process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || ''
          ).toString(),
          CreditCardTypeID: 1,
          DefaultPaymentMethod: creditCardPayload.setAsDefault,
          DefaultPaymentMethodYesNo: creditCardPayload.setAsDefault ? 'Yes' : 'No',
          ExpirationDate: creditCardPayload.expirationDate.toISOString(),
          ExpirationMonth: (creditCardPayload.expirationDate.getMonth() + 1).toString(),
          ExpirationYear: creditCardPayload.expirationDate.getFullYear().toString().substring(2),
          NameOnCard: creditCardPayload.name,
          PersonDisplayID: personDisplayId,
        },
      },
      method: 'post',
      searchParams: { cartId },
    }).json<CreatePaymentMethodResponse>()

    if (response.Success) {
      return response.Data
    } else {
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error('There was an issue saving the credit card.')
  }
}

export const useCreateCreditCardMutation = () => {
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const { setGuestCreditCard } = useCheckoutActions()
  const isPickUp = useCheckoutIsPickUp()
  const guestAddress = useCheckoutGuestAddress()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()

  return useMutation<
    CreatePaymentMethodSuccess['Data'],
    Error,
    Pick<CreateCreditCardOptions, 'address' | 'creditCard' | 'setAsDefault'>
  >({
    mutationFn: data =>
      createCreditCard({
        ...data,
        cartId: cart?.id || '',
        personDisplayId: session?.user?.displayId || '',
      }),
    mutationKey: ['create-credit-card'],
    onError: _error => {
      // Show error.
    },
    onSuccess: response => {
      if (!session?.user?.isGuest) {
        queryClient.invalidateQueries([ADDRESS_CREDIT_CARDS_QUERY_KEY])
      }

      if (session?.user?.isGuest) {
        if (isPickUp) {
          applyCheckoutSelections({
            addressId: activeShippingAddress?.AddressID,
            paymentToken: response?.PaymentToken,
          })
        } else {
          applyCheckoutSelections({
            addressId: guestAddress?.AddressID,
            paymentToken: response?.PaymentToken,
          })
        }
      } else {
        applyCheckoutSelections({
          addressId: activeShippingAddress?.AddressID,
          paymentToken: response?.PaymentToken,
        })
      }

      if (session?.user?.isGuest) {
        setGuestCreditCard({ ...response, FriendlyDescription: '' })
      }
    },
  })
}
