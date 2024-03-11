import { useMemo } from 'react'

import { useLocalStorage } from '@mantine/hooks'
import type { IStorageProperties } from '@mantine/hooks/lib/use-local-storage/create-storage'

interface GiftMessage {
  message: string | undefined
  recipientEmail: string | undefined
}

const initialGiftMessage: GiftMessage = {
  message: '',
  recipientEmail: '',
}

export const useGiftMessageStorage = () => {
  const localStorageOptions: IStorageProperties<GiftMessage> = useMemo(
    () => ({ defaultValue: initialGiftMessage, key: 'gift-message' }),
    []
  )

  const [giftMessage, setGiftMessage] = useLocalStorage<GiftMessage>(localStorageOptions)

  return { giftMessage, setGiftMessage }
}
