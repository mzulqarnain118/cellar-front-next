import { useMemo } from 'react'

import { useLocalStorage } from '@mantine/hooks'
import type { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

export const useAgeVerified = () => {
  const localStorageProps: IStorageProperties<boolean> = useMemo(() => ({ key: 'ageVerified' }), [])
  return useLocalStorage(localStorageProps)
}
