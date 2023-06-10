import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { ADDRESS_CREDIT_CARDS_QUERY_KEY } from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useCheckoutActiveCreditCard } from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

import { useApplyCheckoutSelectionsMutation } from '../checkout/apply-selections'

export const CREATE_ADDRESS_MUTATION_KEY = ['create-address']

export interface CreateAddressOptions {
  address: Address
  callback?: (response: CreateAddressResponse) => void
  cartId?: string
}

interface CreateAddressSuccess {
  Success: true
  Data: {
    Value: {
      AddressID: number
      FirstName: string
      LastName: string
      NickName: string
      Company: string
      City: string
      ProvinceID: string
      CountryName: string
      PhoneNumber: string
      PostalCode: string
      ProvinceAbbreviation: string
      ProvinceName: string
      Street1: string
      Street2: string
      Primary: boolean
      Residential: boolean
    }
  }
}

type CreateAddressResponse = CreateAddressSuccess | Failure

const createAddress = async (data: CreateAddressOptions) => {
  try {
    const response = await api('v2/checkout/CreateShippingAddress', {
      json: {
        ...data.address,
        CountryID: 1,
        CountryTwoLetterISO: 'US',
        County: '',
        DeliveryOffice: null,
        DisplayName: null,
        IsNexus: false,
        IsValid: true,
        LastName2: null,
        Mailing: false,
        PhoneNumberFormat: '',
        Region: '',
        Street4: '',
      },
      method: 'post',
      searchParams: { cartId: data.cartId || '' },
    }).json<CreateAddressResponse>()
    return response
  } catch {
    throw new Error('Something went wrong.')
  }
}

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()

  return useMutation<CreateAddressResponse, Error, CreateAddressOptions>({
    mutationFn: data => createAddress({ ...data, cartId: data.cartId || cart?.id }),
    mutationKey: CREATE_ADDRESS_MUTATION_KEY,
    onError: error => {
      toastError({ message: error.message })
    },
    onSuccess: (response, data) => {
      if (response.Success) {
        if (!session?.user?.isGuest) {
          queryClient.invalidateQueries([
            ADDRESS_CREDIT_CARDS_QUERY_KEY,
            cart?.id,
            session?.user?.isGuest,
          ])
        }
        applyCheckoutSelections({
          addressId: response.Data.Value.AddressID,
          paymentToken: activeCreditCard?.PaymentToken,
        })
        toastSuccess({ message: 'Address saved successfully.' })

        if (data.callback !== undefined) {
          data.callback(response)
        }
      }
    },
  })
}
