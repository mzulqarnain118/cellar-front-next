import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'

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
        PhoneNumber: '',
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
  const { data: cart } = useCartQuery()

  return useMutation<CreateAddressResponse, Error, CreateAddressOptions>(
    CREATE_ADDRESS_MUTATION_KEY,
    data => createAddress({ ...data, cartId: data.cartId || cart?.id }),
    {
      onSuccess: (response, data) => {
        if (data.callback !== undefined) {
          data.callback(response)
        }
      },
    }
  )
}
