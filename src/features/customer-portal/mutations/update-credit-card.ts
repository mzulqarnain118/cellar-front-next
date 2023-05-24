import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'

import { CUSTOMER_QUERY_KEY, CustomerCreditCard } from '../queries/customer'

import { Response } from './types'

export const updateCreditCard = async (creditCard: CustomerCreditCard) => {
  try {
    const response = await api('CustomerPortal/UpdateCreditCard', {
      json: creditCard,
      method: 'post',
    }).json<Response>()

    if (response.hasError) {
      throw new Error('There was an error updating the credit card.')
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useUpdateCreditCardMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, CustomerCreditCard>({
    mutationFn: options => updateCreditCard(options),
    mutationKey: ['update-credit-card'],
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
      showNotification({ message: 'Successfully updated credit card.' })
    },
  })
}
