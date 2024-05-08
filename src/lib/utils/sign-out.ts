import { Router } from 'next/router'

import { anonymize } from '@fullstory/browser'
import { signOut as nextAuthSignOut } from 'next-auth/react'

import { useCheckoutStore } from '../stores/checkout'
import { useCuratedCartStore } from '../stores/curated-cart'

export const signOut = async (redirect = true, router: Router) => {
  if (redirect) {
    const data = await nextAuthSignOut({ redirect: false })
    router.push(data.url)
  } else {
    await nextAuthSignOut({ redirect: false })
  }

  anonymize()
  const {
    actions: { reset: resetCheckout },
  } = useCheckoutStore.getState()
  const { reset: resetCuratedCart } = useCuratedCartStore.getState()
  resetCheckout()
  resetCuratedCart()
}
