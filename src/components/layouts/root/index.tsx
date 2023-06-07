/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode, useCallback, useEffect } from 'react'

import { useRouter } from 'next/router'

import { identify, isInitialized } from '@fullstory/browser'
import { closeAllModals, modals } from '@mantine/modals'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useCuratedCartQuery } from '@/features/curated-cart/queries/curated-cart'
import { useSharedCartQuery } from '@/features/shared-cart/queries/shared-cart'
import { useVipCartQuery } from '@/features/vip-cart/queries/vip-cart'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useStatesQuery } from '@/lib/queries/state'

import { CheckoutLayout } from '../checkout'

import { Footer } from './footer'
import { Header } from './header'
import { StatePicker } from './state-picker'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { ageVerified, setAgeVerified } = useAgeVerified()
  const router = useRouter()
  const { data: session } = useSession()
  const { data: consultant } = useConsultantQuery()
  const { isFetching: isFetchingStates, isLoading: isLoadingStates } = useStatesQuery()
  useCartQuery()
  useSharedCartQuery()
  useCuratedCartQuery()
  useVipCartQuery()

  const handleClick = useCallback(() => {
    setAgeVerified('true')
    modals.closeAll()
  }, [setAgeVerified])

  useEffect(() => {
    if (ageVerified === undefined || ageVerified === 'false') {
      modals.open({
        centered: true,
        children: (
          <div key="age-verified" className="space-y-2">
            <Typography as="p">
              We know it&apos;s rude to ask, but we&apos;re a licensed, bonded winery. You must be
              over 21 years of age to enter.
            </Typography>
            <StatePicker popup />
            <Button fullWidth disabled={isFetchingStates || isLoadingStates} onClick={handleClick}>
              Yes, I am 21 years of age or older
            </Button>
          </div>
        ),
        classNames: {
          title: '!h4',
        },
        title: 'Are you 21 or older?',
      })
    }
  }, [ageVerified, handleClick, isFetchingStates, isLoadingStates, setAgeVerified])

  useEffect(() => {
    if (!router.query.u && consultant?.displayId !== CORPORATE_CONSULTANT_ID) {
      router.query.u = consultant?.url
      router.push(router)
    }
  }, [consultant?.displayId, consultant?.url, router, router.isReady])

  useEffect(() => {
    if (isInitialized() && !!session?.user) {
      // Tell FullStory who you are.
      identify(session.user.displayId, {
        displayName: `${session.user.name.first} ${session.user.name.last}`,
        email: session.user.email,
      })
    }
  }, [session?.user])

  useEffect(
    () => () => {
      closeAllModals()
      modals.closeAll()
    },
    []
  )

  return router.pathname === CHECKOUT_PAGE_PATH ? (
    <CheckoutLayout>{children}</CheckoutLayout>
  ) : (
    <div className="min-h-[100svh] grid" id="root-element">
      {/* ! TODO: Add skip link. */}
      {/* <SkipLink /> */}
      <Header />
      {children}
      <Footer />
    </div>
  )
}
