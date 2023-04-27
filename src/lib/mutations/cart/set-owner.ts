import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'

export const SET_CART_OWNER_MUTATION_KEY = ['set-cart-owner']

export interface SetCartOwnerOptions {
  cartId: string
}

export const setCartOwner = async ({ cartId }: SetCartOwnerOptions) => {
  try {
    const response = await api('v2/SetOrderOwner', { json: { cartId }, method: 'post' }).json()
    return response
  } catch {
    throw new Error('')
  }
}

export const useSetCartOwnerMutation = () => {
  const { data: cart } = useCartQuery()

  return useMutation(SET_CART_OWNER_MUTATION_KEY, () => setCartOwner({ cartId: cart?.id || '' }))
}
