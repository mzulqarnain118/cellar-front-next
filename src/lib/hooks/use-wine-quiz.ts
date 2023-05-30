import { useMemo } from 'react'

import { useSessionStorage } from '@mantine/hooks'
import type { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

export const useWineQuiz = () => {
  const sessionStorageProps: IStorageProperties<string | undefined> = useMemo(
    () => ({ key: 'tastry-sku' }),
    []
  )
  return useSessionStorage(sessionStorageProps)
}
