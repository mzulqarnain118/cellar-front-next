import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { useCustomerPortalActions } from '@/features/store'
import { api } from '@/lib/api'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

import { CUSTOMER_QUERY_KEY } from '../queries/customer'

interface Response {
  status: boolean
}

interface CustomerData {
  dateOfBirth: string
  displayId: string
  companyName?: string
  currentEmail: string
  email: string
  firstName: string
  lastName: string
  mobile: string
  optOutCompanyEmail: boolean
  optOutConsultantEmail: boolean
  personId?: number
  phoneNumber: string
}

export const updateCustomer = async ({
  dateOfBirth,
  companyName,
  currentEmail,
  firstName,
  lastName,
  phoneNumber,
  optOutCompanyEmail,
  optOutConsultantEmail,
  displayId,
  personId,
}: CustomerData) => {
  try {
    const response = await api('update/CustomerPortal', {
      json: {
        Birthday: dateOfBirth,
        CompanyName: companyName || null,
        Email: currentEmail,
        FirstName: firstName,
        LanguageName: 'English',
        LastName: lastName,
        Mobile: phoneNumber,
        OptOutCompanyEmail: optOutCompanyEmail || false,
        OptOutConsultantEmail: optOutConsultantEmail || false,
        PersonDisplayID: displayId,
        PersonID: personId,
        Phone: phoneNumber,
        TranslationLanguageID: 1,
      },
      method: 'post',
    }).json<Response>()

    return response
  } catch {
    throw new Error('There was an error updating the customer.')
  }
}

export const useUpdateCustomerMutation = () => {
  const { data: session } = useSession()
  const { setIsLoading } = useCustomerPortalActions()
  const queryClient = useQueryClient()

  return useMutation<Response, Error, Omit<CustomerData, 'displayId' | 'personId'>>({
    mutationFn: options =>
      updateCustomer({
        ...options,
        displayId: session?.user?.displayId || '',
        personId: 0,
      }),
    mutationKey: ['update-customer'],
    onError: error => {
      toastError({ message: error.message })
    },
    onMutate: () => {
      setIsLoading(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries([CUSTOMER_QUERY_KEY, session?.user?.displayId])
      setIsLoading(false)
    },
    onSuccess: () => {
      toastSuccess({ message: 'Your profile changes are saved!' })
    },
  })
}
