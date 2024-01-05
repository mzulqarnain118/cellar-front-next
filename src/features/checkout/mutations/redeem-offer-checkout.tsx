import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import toast, { toastSuccess } from '@/lib/utils/notifications'
import { notifications } from '@mantine/notifications'
import { SKY_WALLET_QUERY_KEY } from '../queries/sky-wallet'

interface Notifications {
  Notifications: { Message: string }[]
}

interface Response extends Notifications {
  hasError: boolean
  response: { data: { Message: string } & Notifications }
}

interface RedeemOfferOptions {
  CartId?: string
  CouponCode: string
}

export const redeemOfferCheckout = async ({ CouponCode, CartId }: RedeemOfferOptions) => {
  try {
    const response = await api('v2/checkout/AddCouponToCart', {
      method: 'post',
      json: { CartId, CouponCode },
    }).json<Response>()

    // if (!response.hasError) {
    //   return response
    // }

    return response
  } catch (err) {

    throw new Error(err?.message)
  }
}

export const useRedeemOfferCheckoutMutation = () => {
  const { data: session } = useSession()
  const { data: subtotalInfo } = useGetSubtotalQuery();

  const queryClient = useQueryClient()

  const {
    data,
    error,
    isError,
    isSuccess,
    mutate,
    mutateAsync,
  } = useMutation<string | undefined, Error, RedeemOfferOptions>({
    mutationFn: data => {
      return redeemOfferCheckout({ ...data })
    },
    mutationKey: ['redeem-offer'],
    onError: error => {
      toast("error", error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        SKY_WALLET_QUERY_KEY,
        { personDisplayId: session?.user?.displayId, personId: session?.user?.personId },
      ])
    },
    onSuccess: data => {
      notifications.clean()
      if (data?.Success) {
        toastSuccess({ message: 'Coupon redeemed!' })
        // console.log('subTotal: ', subtotalInfo)
      } else {
        toast("error", data?.Error.Message)
      }
    },
  })

  return {
    data,
    error,
    isError,
    isSuccess,
    mutate,
    mutateAsync,
  };
}
