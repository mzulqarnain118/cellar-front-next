import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import toast from '@/lib/utils/notifications'

interface Response {
  Error: { Message: string }
  Success: boolean
}

export const skipSubscription = async (subscriptionId: number, action: string) => {
  try {
    const response = await api('v2/chargebee/skip-or-cancel-subscription', {
      json: { action, subscriptionId },
      method: 'post',
    }).json<Response>()

    if (!response.Success) {
      toast('error', response?.Error?.Message)
      throw new Error(response.Error.Message)
    }

    return response
  } catch {
    throw new Error('There was an error skipping the subscription.')
  }
}

export const useSkipSubscriptionMutation = () =>
  useMutation<Response, Error, { subscriptionId: number; action: string }>({
    mutationFn: ({ subscriptionId, action }) => skipSubscription(subscriptionId, action),
    mutationKey: ['skip-subscription'],
  })
