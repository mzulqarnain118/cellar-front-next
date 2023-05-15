import { QueryClient } from '@tanstack/react-query'
import { signOut as nextAuthSignOut } from 'next-auth/react'

import { CART_QUERY_KEY } from '../queries/cart'
import { useCheckoutStore } from '../stores/checkout'

export const signOut = async (queryClient?: QueryClient) => {
  await nextAuthSignOut()
  const {
    actions: { reset },
  } = useCheckoutStore.getState()
  reset()

  if (queryClient !== undefined) {
    queryClient.invalidateQueries(CART_QUERY_KEY)
  }
}
