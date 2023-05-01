/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react'

import { useRouter } from 'next/router'

import { CompanyLogo } from '@/components/company-logo'
import { SkipLink } from '@/components/skip-link'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { pathname } = useRouter()
  useCartQuery()

  return pathname.startsWith(CHECKOUT_PAGE_PATH) ? (
    <div className="h-full min-h-screen bg-neutral-100">
      <div className="py-4">
        <header className="container mx-auto flex items-center justify-center">
          <CompanyLogo size="lg" />
        </header>
        <main className="container mx-auto">{children}</main>
      </div>
    </div>
  ) : (
    <div className="min-h-[100svh mt-[7.875rem]" id="root-element">
      <SkipLink />
      <Header />

      <main tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
