/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode, useCallback, useEffect } from 'react'

import { useRouter } from 'next/router'

import { modals } from '@mantine/modals'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

import { CheckoutLayout } from '../checkout'

import { Footer } from './footer'
import { Header } from './header'
import { StatePicker } from './state-picker'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { pathname } = useRouter()
  const [ageVerified, setAgeVerified] = useAgeVerified()
  useCartQuery()

  const handleClick = useCallback(() => {
    setAgeVerified(true)
    modals.closeAll()
  }, [setAgeVerified])

  useEffect(() => {
    if (!ageVerified) {
      modals.open({
        centered: true,
        children: (
          <div className="space-y-2">
            <Typography as="p">
              We know it&apos;s rude to ask, but we&apos;re a licensed, bonded winery. You must be
              over 21 years of age to enter.
            </Typography>
            <StatePicker popup />
            <Button dark fullWidth onClick={handleClick}>
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
  }, [ageVerified, handleClick, setAgeVerified])

  return pathname === CHECKOUT_PAGE_PATH ? (
    <CheckoutLayout>{children}</CheckoutLayout>
  ) : (
    <div className="min-h-[100svh]" id="root-element">
      {/* ! TODO: Add skip link. */}
      {/* <SkipLink /> */}
      <Header />
      {children}
      <Footer />
    </div>
  )
}
