import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

import { SKY_WALLET_QUERY_KEY } from '../queries/sky-wallet'

interface Notifications {
  Notifications: { Message: string }[]
}

interface Response extends Notifications {
  hasError: boolean
  response: { data: { Message: string } & Notifications }
}

interface RedeemOfferOptions {
  couponCode: string
}

export const redeemOffer = async ({ couponCode }: RedeemOfferOptions) => {
  try {
    const response = await api('CustomerPortal/AddCouponToSkyWallet', {
      method: 'post',
      searchParams: { couponCode },
    }).json<Response>()

    if (!response.hasError) {
      return response.response.data.Message
    }
  } catch {
    throw new Error('There was an error redeeming the offer.')
  }
}

export const useRedeemOfferMutation = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  return useMutation<string | undefined, Error, RedeemOfferOptions>({
    mutationFn: data => redeemOffer(data),
    mutationKey: ['redeem-offer'],
    onError: error => {
      toastError({ message: error.message })
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        SKY_WALLET_QUERY_KEY,
        { personDisplayId: session?.user?.displayId, personId: session?.user?.personId },
      ])
    },
    onSuccess: data => {
      if (data !== undefined) {
        toastSuccess({ message: data })
      }
    },
  })
}
