import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'

interface SkyWalletData {
  BalanceAvailableToUse: number
  BalanceTypeName: string
}

interface GetCartSkyWalletBalancesSuccess {
  Success: true
  Data: SkyWalletData[]
}

type GetCartSkyWalletBalances = GetCartSkyWalletBalancesSuccess | Failure

export const getSkyWallet: QueryFunction<SkyWalletData[] | null, string[]> = async ({
  queryKey,
}) => {
  try {
    const cartId = queryKey[1]
    if (cartId.length === 0) {
      return null
    }

    const response = await api('v2/checkout/GetCartSkyWallet', {
      method: 'get',
      searchParams: { cartId },
    }).json<GetCartSkyWalletBalances>()

    if (response.Success) {
      return response.Data
    }

    return null
  } catch {
    return null
  }

}

export const SKY_WALLET_QUERY_KEY = 'checkout-sky-wallet'

export const useSkyWalletQuery = () => {
  const { data: cart } = useCartQuery()

  return useQuery({ queryFn: getSkyWallet, queryKey: [SKY_WALLET_QUERY_KEY, cart?.id || ''] })
}
