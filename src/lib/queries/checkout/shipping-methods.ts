import { useMemo } from 'react'

import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { CORPORATE_GIFTING_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { useCheckoutActiveShippingAddress, useCheckoutGuestAddress } from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'

import { useCartQuery } from '../cart'

interface ShippingMethod {
  DisplayName: string
  ShippingMethodID: number
  ShippingPrice: number
}

export type ShippingMethods = {
  displayName: string
  shippingMethodId: number
  shippingPrice: number
}[]

interface GetShippingMethodsSuccess {
  Success: true
  Data: ShippingMethod[]
}

/**
 * Get shipping methods response.
 */
export type GetShippingMethodsResponse = GetShippingMethodsSuccess | Failure

const getShippingMethods: QueryFunction<
  { displayName: string; shippingMethodId: number; shippingPrice: number }[]
> = async ({ queryKey }) => {
  try {
    const orderDisplayId = `${queryKey[1]}`
    const response = await api('v2/checkout/GetShippingMethodsBasedOnOrder', {
      searchParams: { OrderDisplayId: orderDisplayId },
    }).json<GetShippingMethodsResponse>()
    if (response.Success && response.Data) {
      return response.Data.filter(
        method => method.ShippingMethodID !== CORPORATE_GIFTING_SHIPPING_METHOD_ID
      ).map(method => ({
        displayName: method.DisplayName,
        shippingMethodId: method.ShippingMethodID,
        shippingPrice: method.ShippingPrice,
      }))
    }
    return []
  } catch (error) {
    throw new Error('There was an error fetching the shipping methods.')
  }
}

export const SHIPPING_METHODS_QUERY_KEY = 'shipping-methods'

export const useShippingMethodsQuery = () => {
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const guestAddress = useCheckoutGuestAddress()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const address = useMemo(
    () => (session?.user?.isGuest ? guestAddress : activeShippingAddress),
    [activeShippingAddress, guestAddress, session?.user?.isGuest]
  )

  return useQuery({
    enabled: !!address,
    queryFn: getShippingMethods,
    queryKey: [SHIPPING_METHODS_QUERY_KEY, cart?.orderDisplayId, address?.AddressID],
  })
}
