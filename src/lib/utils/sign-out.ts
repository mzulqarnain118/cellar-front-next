import { anonymize } from '@fullstory/browser'
import { QueryClient } from '@tanstack/react-query'
import { signOut as nextAuthSignOut } from 'next-auth/react'

import { CART_QUERY_KEY } from '../queries/cart'
import { useCheckoutStore } from '../stores/checkout'
import { useCuratedCartStore } from '../stores/curated-cart'

export const signOut = async (queryClient?: QueryClient, redirect = true) => {
  await nextAuthSignOut({ redirect })
  anonymize()
  const {
    actions: { reset: resetCheckout },
  } = useCheckoutStore.getState()
  const { reset: resetCuratedCart } = useCuratedCartStore.getState()
  resetCheckout()
  resetCuratedCart()

  if (queryClient !== undefined) {
    queryClient.invalidateQueries(CART_QUERY_KEY)
  }
}
