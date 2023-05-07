import { useMemo } from 'react'

import { useLocalStorage } from '@mantine/hooks'
import type { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

import { Cart } from '../types'

export const useCartStorage = () => {
  const localStorageOptions: IStorageProperties<Cart | undefined> = useMemo(
    () => ({ key: 'cart' }),
    []
  )
  return useLocalStorage<Cart | undefined>(localStorageOptions)
}
