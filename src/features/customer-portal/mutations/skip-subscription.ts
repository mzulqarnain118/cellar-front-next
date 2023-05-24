import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'

interface Response {
  Error: { Message: string }
  Success: boolean
}

export const skipSubscription = async (subscriptionId: number) => {
  try {
    const response = await api('v2/chargebee/skip-or-cancel-subscription', {
      json: { action: 'skip', subscriptionId },
      method: 'post',
    }).json<Response>()

    if (!response.Success) {
      throw new Error(response.Error.Message)
    }

    return response
  } catch {
    throw new Error('')
  }
}

export const useSkipSubscriptionMutation = () =>
  useMutation<Response, Error, number>({
    mutationFn: data => skipSubscription(data),
    mutationKey: ['skip-subscription'],
  })
