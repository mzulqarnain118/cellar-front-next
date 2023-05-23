import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'
import { Address } from '@/lib/types/address'

import { CUSTOMER_QUERY_KEY } from '../queries/get-customer'

import { Response } from './types'

export const createAddress = async (address: Address) => {
  try {
    const response = await api('CustomerPortal/CreateAddress', {
      json: {
        ...address,
        CountryID: 1,
        CountryTwoLetterISO: 'US',
        County: '',
        DeliveryOffice: null,
        DisplayName: null,
        IsNexus: false,
        IsValid: true,
        LastName2: null,
        Mailing: false,
        PhoneNumber: '',
        PhoneNumberFormat: '',
        Region: '',
        Street4: '',
      },
      method: 'post',
    }).json<Response>()

    if (response.hasError) {
      throw new Error('There was an error adding the address.')
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useCreateAddressMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, Address>({
    mutationFn: options => createAddress(options),
    mutationKey: ['create-customer-address'],
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
      showNotification({ message: 'Address created successfully!' })
    },
  })
}
