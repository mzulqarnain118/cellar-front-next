import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SKY_WALLET_QUERY_KEY } from '@/features/checkout/queries/sky-wallet'
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
    throw new Error('There was an error updating the cart owner.')
  }
}

export const useSetCartOwnerMutation = () => {
  const { data: cart } = useCartQuery()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => setCartOwner({ cartId: cart?.id || '' }),
    mutationKey: SET_CART_OWNER_MUTATION_KEY,
    onSettled: () => {
      queryClient.invalidateQueries([SKY_WALLET_QUERY_KEY, cart?.id || ''])
    },
  })
}
