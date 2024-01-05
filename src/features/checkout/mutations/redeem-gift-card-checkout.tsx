import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'
import toast, { toastError, toastSuccess } from '@/lib/utils/notifications'
import { SKY_WALLET_QUERY_KEY } from '../queries/sky-wallet'


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
    }).json<VerifyGiftCardCodeResponse>();

    if (validation.Success) {
      const response = await api('v2/checkout/RedeemGiftCardCode', {
        json: { cartId, code: giftCard },
        method: 'post',
      }).json<RedeemGiftCardResponse>();

      if (response.Success) {
        return response
      }
    }

    return validation;
  } catch (error) {
    console.error("Redeem Gift Card Error:", error);
    throw new Error('There was an error redeeming the gift card.');
  }
};


export const useRedeemGiftCardCheckoutMutation = () => {
  const { data: cart } = useCartQuery();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data,
    error,
    isError,
    isSuccess,
    onSettled,
    mutate,
    mutateAsync,
  } = useMutation<SkyWalletBalances[] | undefined, Error, RedeemGiftCardCodeOptions>({
    mutationFn: async (data) => {
      try {
        const result = await redeemGiftCard({ ...data, cartId: cart?.id || '' });
        return result;
      } catch (error) {
        throw error;
      }
    },
    mutationKey: ['redeem-gift-card-checkout'],
    onError: (error) => {
      toastError({ message: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        SKY_WALLET_QUERY_KEY,
        { personDisplayId: session?.user?.displayId, personId: session?.user?.personId },
      ])
    },
    onSuccess: (data) => {
      if (data?.Success) {

        toastSuccess({ message: 'Gift card redeemed' })
      } else {
        const errorMessage = data?.Error?.Message
        toast("error", errorMessage);
      }
    },
  });

  return {
    data,
    error,
    isError,
    isSuccess,
    onSettled,
    mutate,
    mutateAsync,
  };
};
