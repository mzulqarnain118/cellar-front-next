import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'

import { CUSTOMER_QUERY_KEY } from '../queries/get-customer'

import { Response } from './types'

interface DeleteAddressOptions {
  addressId: number
}

export const deleteAddress = async ({ addressId }: DeleteAddressOptions) => {
  try {
    const response = await api('CustomerPortal/DeleteAddress', {
      method: 'delete',
      searchParams: { addressId },
    }).json<Response>()

    if (response.hasError) {
      throw new Error('Could not delete address')
    }
    return response
  } catch {
    throw new Error('')
  }
}

export const useDeleteAddressMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, DeleteAddressOptions>({
    mutationFn: options => deleteAddress(options),
    mutationKey: ['delete-address'],
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
      showNotification({ message: 'The address deleted successfully.' })
    },
  })
}
