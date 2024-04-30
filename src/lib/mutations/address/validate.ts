import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'
import toast from '@/lib/utils/notifications'

export const VALIDATE_ADDRESS_QUERY_KEY = ['validate-address']

export interface ValidateAddressOptions {
  callback?: (response: ValidateAddressResponse) => void
  cartId?: string
  addressLineOne: string
  addressLineTwo: string
  city: string
  company: string
  countryName: string
  firstName: string
  lastName: string
  nickName?: string
  provinceId: number
  residential: boolean
  zipCode: string
}

interface ValidateAddressSuccess {
  Success: true
  Data: {
    OriginalAddress: Address
    ValidatedAddresses: Address[]
  }
  Error: {
    Code: string
    Message: string
    Traceback?: Record<string, unknown>
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
        NickName: data.nickName,
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
      if (response.Success) {
        if (data.callback !== undefined) {
          data.callback(response)
        }
      } else if (!response.Success) {
        toast('error', response?.Error.Message)
      }
    },
  })
}
