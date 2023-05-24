import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'

import { CUSTOMER_QUERY_KEY, CustomerAddress } from '../queries/customer'

import { Response } from './types'

export const updateAddress = async (address: CustomerAddress) => {
  try {
    const response = await api('CustomerPortal/UpdateAddress', {
      json: address,
      method: 'post',
    }).json<Response>()

    if (response.hasError) {
      throw new Error('There was an error updating the address.')
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useUpdateAddressMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, CustomerAddress>({
    mutationFn: options => updateAddress(options),
    mutationKey: ['update-address'],
    onError: error => {
      showNotification({ message: error?.message })
    },
    onMutate: () => {
      setIsLoading(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEY, session?.user?.displayId])
      setIsLoading(false)
    },
    onSuccess: () => {
      showNotification({ message: 'Address updated successfully.' })
    },
  })
}
