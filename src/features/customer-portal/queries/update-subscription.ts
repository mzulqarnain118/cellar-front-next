import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

import { CustomerSubscription } from './edit-subscription'

interface Response {
  ResultCode: number
  Notifications: { Message: string | null; NotificationType: number }[] | null
  ValidationResults:
    | {
        MemberNames: string[] | null
        ErrorMessage: string | null
      }[]
    | null
}

export const updateSubscription = async (subscription: CustomerSubscription) => {
  try {
    const response = await api('CustomerPortal/SaveSubscription', {
      json: subscription,
      method: 'post',
    }).json<Response>()

    return response
  } catch {
    throw new Error('')
  }
}

export const useUpdateSubscriptionMutation = () =>
  useMutation<Response, Error, CustomerSubscription>({
    mutationFn: data => updateSubscription(data),
    mutationKey: ['update-subscription'],
  })
