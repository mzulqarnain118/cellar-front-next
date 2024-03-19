import { useMemo } from 'react'

import { useLocalStorage } from '@mantine/hooks'
import { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

import { Tasting } from '../types'

export const useTastingEventStorage = () => {
  const localStorageOptions: IStorageProperties<Tasting | undefined> = useMemo(
    () => ({ key: 'tasting' }),
    []
  )
  return useLocalStorage<Tasting | undefined | null>(localStorageOptions)
}
