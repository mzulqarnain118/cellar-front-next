import { useMemo } from 'react'

import { useLocalStorage } from '@mantine/hooks'
import type { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

export interface ScoutAndCellarPickUpAddress {
  addressLineOne: string
  addressLineTwo: string
  city: string
  state: string
  zipCode: string
  country: string
  phoneNumber: string
  addressType: string
  storeId: string
}

export const useCartStorage = () => {
  const localStorageOptions: IStorageProperties<ScoutAndCellarPickUpAddress[] | undefined> =
    useMemo(() => ({ key: 'scLocations' }), [])
  return useLocalStorage<ScoutAndCellarPickUpAddress[] | undefined>(localStorageOptions)
}
