import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'

export const VALIDATE_ADDRESS_QUERY_KEY = ['validate-address']

export interface ValidateAddressOptions {
  callback?: (response: ValidateAddressResponse) => void
  cartId?: string
  addressLineOne: string
  addressLineTwo: string
  city: string
  company: string
  firstName: string
  lastName: string
  provinceId: number
  zipCode: string
}

interface ValidateAddressSuccess {
  Success: true
  Data: {
    OriginalAddress: Address
    ValidatedAddresses: Address[]
  }
}
type ValidateAddressResponse = ValidateAddressSuccess | Failure

const validateAddress = async (data: ValidateAddressOptions) => {
  try {
    const response = api('v2/AddressValidation/ValidateAddress', {
      json: {
        City: data.city,
        Company: data.company,
        CountryID: 1,
        CountryName: 'United States',
        FirstName: data.firstName,
        LastName: data.lastName,
        PostalCode: data.zipCode,
        ProvinceID: data.provinceId,
        Street1: data.addressLineOne,
        Street2: data.addressLineTwo,
      },
      method: 'post',
      searchParams: {
        cartId: data.cartId || '',
      },
    }).json<ValidateAddressResponse>()
    return response
  } catch {
    throw new Error('Something went wrong.')
  }
}

export const useValidateAddressMutation = () => {
  const { data: cart } = useCartQuery()

  return useMutation<ValidateAddressResponse, Error, ValidateAddressOptions>({
    mutationFn: data => validateAddress({ ...data, cartId: data.cartId || cart?.id }),
    mutationKey: VALIDATE_ADDRESS_QUERY_KEY,
    onSuccess: (response, data) => {
      if (data.callback !== undefined) {
        data.callback(response)
      }
    },
  })
}
