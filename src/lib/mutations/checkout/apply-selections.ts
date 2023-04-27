import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { Failure } from '@/lib/types'

export const APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY = ['apply-checkout-selections']

export interface ApplyCheckoutSelectionsOptions {
  addressId: number
  cartId?: string
  paymentToken?: string
  userDisplayId?: string
}

type Response = { Success: true } | Failure
export const applyCheckoutSelections = async ({
  addressId,
  cartId,
  paymentToken,
  userDisplayId,
}: ApplyCheckoutSelectionsOptions) => {
  try {
    const response = await api('v2/checkout/ApplyCheckoutSelections', {
      json: {
        addressId,
        billingOption: '2',
        paymentMethodID: 1,
        paymentToken,
        personDisplayId: userDisplayId || '',
        personTypeId: 2,
        shippingOption: 2,
      },
      method: 'post',
      searchParams: { cartId: cartId || '' },
    }).json<Response>()
    return response
  } catch {
    throw new Error('')
  }
}

export const useApplyCheckoutSelectionsMutation = () => {
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()

  return useMutation<Response, Error, ApplyCheckoutSelectionsOptions>(
    APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY,
    data =>
      applyCheckoutSelections({
        ...data,
        cartId: data.cartId || cart?.id,
        userDisplayId: data.userDisplayId || session?.user.displayId,
      })
  )
}
