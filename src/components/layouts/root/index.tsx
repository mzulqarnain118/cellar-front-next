/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react'

import { useRouter } from 'next/router'

import { SkipLink } from '@/components/skip-link'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

import { CheckoutLayout } from '../checkout'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { pathname } = useRouter()
  useCartQuery()

  return pathname === CHECKOUT_PAGE_PATH ? (
    <CheckoutLayout>{children}</CheckoutLayout>
  ) : (
    <div className="min-h-[100svh]" id="root-element">
      <SkipLink />
      <Header />

      <main tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
