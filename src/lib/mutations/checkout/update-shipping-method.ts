import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { GET_SUBTOTAL_QUERY } from '@/lib/queries/checkout/get-subtotal'
import { Failure } from '@/lib/types'

interface Cart {
  OrderID: number
  DisplayID: string
  OrderDate: string
  Subtotal: number
  OrderLines: {
    DisplayPrice: number
    Price: number
    Quantity: number
    ProductDisplayName: string
    ProductSKU: string
    ProductImage: string
    OrderLineID: number
    OrderID: number
  }[]
  DiscountTotals: {
    TotalDescription: string
    TotalAmount: number
  }[]
}

interface Subtotal {
  Subtotal: number
  SubtotalAfterSavings: number
  OrderTotal: number
  Tax: number
  Shipping: number
  DiscountTotals: {
    TotalDescription: string
    TotalAmount: number
  }[]
  ShippingMethodID: number
  RetailDeliveryFee: number
  ShippingMethods: {
    ShippingMethodID: number
    DisplayName: string
    ShippingPrice: number
  }[]
}

interface SubtotalSuccess {
  Success: true
  Data: {
    Order: Subtotal
  }
}

interface SkywalletSuccess {
  Success: true
  Data: {
    BalanceAvailableToUse: number
    BalanceTypeName: string
  }[]
}

interface UpdateShippingMethodSuccess {
  Success: true
  Data: {
    Cart: {
      Success: boolean
      Data: Cart
    }
    Skywallet: SkywalletSuccess | Failure
    Subtotal: SubtotalSuccess | Failure
  }
}

export type UpdateShippingMethodResponse = UpdateShippingMethodSuccess | Failure

interface UpdateShippingMethodOptions {
  cartId?: string
  shippingMethodId: number
}

export const updateShippingMethod = async ({
  cartId = '',
  shippingMethodId,
}: UpdateShippingMethodOptions) => {
  try {
    const response = await api('v2/checkout/UpdateShippingMethod', {
      method: 'post',
      searchParams: {
        cartId,
        shippingMethodId,
      },
    }).json<UpdateShippingMethodResponse>()
    return response
  } catch {
    throw new Error('There was an error updating the shipping method.')
  }
}

export const useUpdateShippingMethodMutation = () => {
  const queryClient = useQueryClient()
  const { data: cart } = useCartQuery()
  // const { activeShippingAddress } = useCheckoutActiveShippingAddress()
  // const { setShippingMethod } = useCheckoutActions()

  return useMutation<UpdateShippingMethodResponse, Error, UpdateShippingMethodOptions>({
    mutationFn: data => updateShippingMethod({ ...data, cartId: cart?.id }),
    mutationKey: ['update-shipping-method'],
    onSettled: () => {
      queryClient.invalidateQueries([GET_SUBTOTAL_QUERY, cart?.id])
    },
  })
}
