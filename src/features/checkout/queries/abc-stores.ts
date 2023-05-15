import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { Failure } from '@/lib/types'

export interface ABCStore {
  addressId: number
  city: string
  provinceId: number
  postalCode: string
  provinceAbbreviation: string
  provinceName: string
  street1: string
  street2: string
  displayName: string
}

interface GetABCStoresSuccess {
  Success: true
  Data: {
    Abbreviation: string
    AddressID: number
    City: string
    Name: string
    PostalCode: string
    ProvinceID: number
    Street1: string
    Street2: string
  }[]
}

type GetABCStoresResponse = GetABCStoresSuccess | Failure

export const getAbcStores: QueryFunction<ABCStore[]> = async () => {
  try {
    const response = await api('v2/abcstores', {
      method: 'get',
      timeout: 90000,
    }).json<GetABCStoresResponse>()

    if (response.Success) {
      return response.Data.map(store => {
        const street2 = `, ${store.Street2},`
        const postalCode = store.PostalCode.substring(0, 5)
        return {
          addressId: store.AddressID,
          city: store.City,
          displayName: `${store.Street1}${store.Street2 ? street2 : ','} ${store.City}, ${
            store.Abbreviation
          } ${postalCode}`,
          postalCode,
          provinceAbbreviation: store.Abbreviation,
          provinceId: store.ProvinceID,
          provinceName: store.Name,
          street1: store.Street1,
          street2: store.Street2,
        }
      })
    } else {
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error('')
  }
}

export const ABC_STORES_QUERY_KEY = 'abc'
export const useAbcStoresQuery = () =>
  useQuery({
    queryFn: getAbcStores,
    queryKey: [ABC_STORES_QUERY_KEY],
  })
