import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'

interface Response {
  result: {
    AccountCredit: number
    Balances: {
      AllowApplyToSubscriptions: boolean
      AllowOnDemandTransfers: boolean
      AllowOnDemandWithdrawals: boolean
      AllowPayout: boolean
      AllowTransfers: boolean
      ApplyToSubscriptions: boolean
      Balance: number
      CurrencyISOCode: string
      DisplayAsCurrency: boolean
      Name: string
      SkyWalletBalanceID: boolean
    }[]
    Coupons: {
      CouponCode: string
      DateAdded: string
      EndDateTime: string
      MaxUsesPerPerson: number
      NumberUsed: number
      PromotionalRewardName: string
      StartDateTime: string
    }[]
    CurrencyCulture: string
    CurrencyTypeID: number
    GiftCardEnabled: boolean
    // TODO: Type-guard this.
    GiftCards: unknown[]
    PersonID: number
    sorted_transactions: {
      Amount: number
      Balance: number
      CurrencyISOCode: string
      CurrencyTypeID: number
      Details: string
      DisplayAsCurrency: boolean
      name: string
      SkyWalletBalanceID: number
      SkyWalletTransactionID: number
      TransactionDate: string
    }[]
    // TODO: Type-guard this.
    Transactions: unknown[]
  }
  status: boolean
}

interface GetSkywalletOptions {
  personDisplayId: string
  personId: number
}

export const getSkywallet: QueryFunction<Response['result'] | undefined> = async ({ queryKey }) => {
  try {
    const { personDisplayId, personId } = queryKey[1] as GetSkywalletOptions
    const response = await api('Shopping/GetSortedSkyWalletBalance', {
      json: { PersonDisplayID: personDisplayId, PersonID: personId },
      method: 'post',
    }).json<Response>()

    if (response.status) {
      return response.result
    }
  } catch {
    throw new Error('')
  }
}

export const SKYWALLET_QUERY_KEY = 'skywallet'

export const useSkywalletQuery = () => {
  const { data: session } = useSession()

  return useQuery({
    queryFn: getSkywallet,
    queryKey: [
      'skywallet',
      { personDisplayId: session?.user?.displayId, personId: session?.user?.personId },
    ],
  })
}
