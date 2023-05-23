import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'

import { CUSTOMER_QUERY_KEY } from '../queries/get-customer'

import { Response } from './types'

export const deleteCreditCard = async (paymentToken: string) => {
  try {
    const response = await api('CustomerPortal/DeleteCreditCard', {
      method: 'delete',
      searchParams: { paymentToken },
    }).json<Response>()

    if (response.hasError) {
      throw new Error('There was an error deleting the credit card.')
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useDeleteCreditCardMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, string>({
    mutationFn: options => deleteCreditCard(options),
    mutationKey: ['delete-credit-card'],
    onError: error => {
      showNotification({ message: error.message })
    },
    onMutate: () => {
      setIsLoading(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEY, session?.user?.displayId])
      setIsLoading(false)
    },
    onSuccess: () => {
      showNotification({ message: 'Credit card deleted successfully!' })
    },
  })
}
