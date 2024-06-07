import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'
import { Address } from '@/lib/types/address'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

import { CUSTOMER_QUERY_KEY, CustomerCreditCard } from '../queries/customer'

import { Response } from './types'

const DEFAULT_CREDIT: CustomerCreditCard = {
  Address: {
    AddressID: 0,
    City: '',
    Company: '',
    CountryID: 0,
    CountryName: '',
    CountryTwoLetterISO: '',
    County: '',
    DeliveryOffice: '',
    DisplayDeliveryOffice: true,
    DisplayLastName2: true,
    DisplayName: '',
    DisplayPostalCode: true,
    DisplayRegion: true,
    DisplayStreet3: true,
    DisplayStreet4: true,
    FirstName: '',
    IsNexus: true,
    IsValid: true,
    LastName: '',
    LastName2: '',
    Mailing: true,
    NickName: '',
    PersonDisplayID: '',
    PersonID: 0,
    PersonTypeID: 0,
    PhoneNumber: '',
    PhoneNumberFormat: '',
    PostalCode: '',
    Primary: true,
    ProvinceAbbreviation: '',
    ProvinceID: 0,
    ProvinceName: '',
    Region: '',
    Residential: true,
    SpecialInstructions: '',
    Street1: '',
    Street2: '',
    Street3: '',
    Street4: '',
  },
  AddressID: 0,
  CVV: '',
  CardNumber: '',
  CreditCardTypeID: 1,
  CreditCardTypeName: 'Visa',
  DefaultPaymentMethod: false,
  DefaultPaymentMethodYesNo: '',
  DisplayNumber: '',
  ExpirationDate: '',
  ExpirationMonth: '',
  ExpirationYear: '',
  GatewayInfoID: null,
  IsUsed: true,
  NameOnCard: '',
  PaymentToken: '',
  PersonDisplayID: '',
  ProfilePaymentNonceToken: null,
  ProfilePaymentToken: null,
  RequireCardNumber: true,
}

interface CreateCreditCardOptions {
  address: Address
  creditCard: {
    cvv: string
    expiry: string
    name: string
    number: string
  }
  setAsDefault?: boolean
}

export const createCreditCard = async ({
  address,
  creditCard,
  setAsDefault = false,
}: CreateCreditCardOptions) => {
  try {
    const response = await api('CustomerPortal/CreateCreditCard', {
      json: {
        ...DEFAULT_CREDIT,
        Address: {
          ...DEFAULT_CREDIT.Address,
          ...address,
          ProvinceID: parseInt(address.ProvinceID),
        },
        CVV: creditCard.cvv,
        CardNumber: creditCard.number.replaceAll(' ', ''),
        DefaultPaymentMethod: setAsDefault,
        ExpirationDate: '',
        ExpirationMonth: creditCard.expiry.split('/')[0],
        ExpirationYear: creditCard.expiry.split('/')[1],
        NameOnCard: creditCard.name,
      } satisfies CustomerCreditCard,
      method: 'post',
    }).json<Response>()

    if (response.hasError) {
      throw new Error('There was an error creating the credit card.')
    }

    return response
  } catch {
    throw new Error('There was an error creating the credit card.')
  }
}

export const useCreateCreditCardMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, CreateCreditCardOptions>({
    mutationFn: options => createCreditCard(options),
    mutationKey: ['create-customer-credit-card'],
    onError: error => {
      toastError({ message: error.message })
    },
    onMutate: () => {
      setIsLoading(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEY, session?.user?.displayId])
      setIsLoading(false)
    },
    onSuccess: () => {
      toastSuccess({ message: 'Credit card created successfully!' })
    },
  })
}
