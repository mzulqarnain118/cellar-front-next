import { useEffect, useMemo } from 'react'

import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { GROUND_SHIPPING_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import {
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { Failure } from '@/lib/types'

import { useCartQuery } from '../cart'

interface ShippingMethod {
  ShippingMethodID: number
  DisplayName: string
  ShippingPrice: number
}

interface SubtotalData {
  Order: {
    Subtotal: number
    SubtotalAfterSavings: number
    OrderTotal: number
    Tax: number
    Shipping: number
    RetailDeliveryFee: number
    DiscountTotals: {
      TotalDescription: string
      TotalAmount: number
    }[]
    ShippingMethods: ShippingMethod[]
    ShippingMethodID: number
  }
}

interface GetSubtotalInfoSuccess {
  Success: true
  Data: SubtotalData
}

type GetSubtotalInfoResponse = GetSubtotalInfoSuccess | Failure

export interface OrderPrice {
  default?: boolean
  discountTotals: {
    description: string
    amount: number
  }[]
  orderTotal: number
  retailDeliveryFee: number
  shipping: {
    displayName: string
    methodId: number
    price: number
  }
  subtotal: number
  subtotalAfterSavings: number
  tax: number
}

const defaultOrderPrice: OrderPrice = {
  default: true,
  discountTotals: [],
  orderTotal: 0,
  retailDeliveryFee: 0,
  shipping: {
    displayName: '',
    methodId: GROUND_SHIPPING_SHIPPING_METHOD_ID,
    price: 0,
  },
  subtotal: 0,
  subtotalAfterSavings: 0,
  tax: 0,
}

export const getSubtotal: QueryFunction<OrderPrice> = async ({ queryKey }) => {
  try {
    const cartId = queryKey[1] as string

    if (!cartId) {
      return defaultOrderPrice
    }

    const response = await api('v2/checkout/GetSubtotalInfo', {
      method: 'get',
      searchParams: { cartId },
    }).json<GetSubtotalInfoResponse>()
    if (response.Success) {
      const {
        DiscountTotals: discountTotals = [],
        OrderTotal: orderTotal = 0,
        RetailDeliveryFee: retailDeliveryFee = 0,
        Shipping: shippingPrice = 0,
        ShippingMethodID: shippingMethodId = GROUND_SHIPPING_SHIPPING_METHOD_ID,
        ShippingMethods: shippingMethods = [],
        Subtotal: subtotal = 0,
        SubtotalAfterSavings: subtotalAfterSavings = 0,
        Tax: tax = 0,
      } = response.Data.Order
      const currentShippingMethod = shippingMethods.find(
        method => method.ShippingMethodID === shippingMethodId
      )

      return {
        discountTotals: discountTotals.map(total => ({
          amount: total.TotalAmount,
          description: total.TotalDescription,
        })),
        orderTotal,
        retailDeliveryFee,
        shipping: {
          displayName: currentShippingMethod?.DisplayName || '',
          methodId: shippingMethodId,
          price: shippingPrice,
        },
        subtotal,
        subtotalAfterSavings,
        tax,
      } satisfies OrderPrice
    } else {
      return defaultOrderPrice
    }
  } catch {
    throw new Error('There was an error fetching the subtotal.')
  }
}

export const GET_SUBTOTAL_QUERY = 'get-subtotal'

export const useGetSubtotalQuery = (cartId?: string) => {
  // Log file name
  // console.log(new Error().stack?.split("\n")[2].trim());
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const guestAddress = useCheckoutGuestAddress()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const address = useMemo(
    () => (session?.user?.isGuest ? guestAddress : activeShippingAddress),
    [activeShippingAddress, guestAddress, session?.user?.isGuest]
  )
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const applySelectionsAndRefetch = async () => {
    await applyCheckoutSelections({
      addressId: address?.AddressID,
      cartId: cartId || cart?.id,
      paymentToken: activeCreditCard?.PaymentToken,
    })
  }

  useEffect(() => {
    if (!cartId && cart?.id) {
      applySelectionsAndRefetch()
    }
  }, [cartId, cart?.id])

  return useQuery({
    onSuccess: data => {
      if (data.orderTotal === 0 && !data.default) {
        applyCheckoutSelections({
          addressId: address?.AddressID,
          cartId: cartId || cart?.id,
          paymentToken: activeCreditCard?.PaymentToken,
        })
      }
    },
    queryFn: getSubtotal,
    queryKey: [GET_SUBTOTAL_QUERY, cartId || cart?.id],
  })
}
