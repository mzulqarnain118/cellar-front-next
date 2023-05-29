import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

import { SKYWALLET_QUERY_KEY } from '../queries/skywallet'

interface VerifyGiftCardCodeSuccess {
  Success: true
  Data: {
    Valid: boolean
    CurrencyTypeID: number
    Amount: number
  }
}

type VerifyGiftCardCodeResponse = VerifyGiftCardCodeSuccess | Failure

interface SkyWalletBalances {
  BalanceAvailableToUse: number
  BalanceTypeName: string
}

interface RedeemGiftCardSuccess {
  Success: true
  Data: {
    Skywallet: SkyWalletBalances[]
  }
}

type RedeemGiftCardResponse = RedeemGiftCardSuccess | Failure

interface RedeemGiftCardCodeOptions {
  cartId: string
  giftCard: string
}

export const redeemGiftCard = async ({ cartId, giftCard }: RedeemGiftCardCodeOptions) => {
  try {
    const validation = await api('v2/checkout/VerifyGiftCardCode', {
      method: 'get',
      searchParams: { code: giftCard },
    }).json<VerifyGiftCardCodeResponse>()

    if (validation.Success) {
      const response = await api('v2/checkout/RedeemGiftCardCode', {
        json: { cartId, code: giftCard },
        method: 'post',
      }).json<RedeemGiftCardResponse>()

      if (response.Success) {
        return response.Data.Skywallet
      }
    }
  } catch {
    throw new Error('')
  }
}

export const useRedeemGiftCardMutation = () => {
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  return useMutation<
    SkyWalletBalances[] | undefined,
    Error,
    Pick<RedeemGiftCardCodeOptions, 'giftCard'>
  >({
    mutationFn: data => redeemGiftCard({ ...data, cartId: cart?.id || '' }),
    mutationKey: ['redeem-gift-card'],
    onError: error => {
      toastError({ message: error.message })
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        SKYWALLET_QUERY_KEY,
        { personDisplayId: session?.user?.displayId, personId: session?.user?.personId },
      ])
    },
    onSuccess: () => {
      toastSuccess({ message: 'Gift card redeemed' })
    },
  })
}
