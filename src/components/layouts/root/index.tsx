/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react'

import { useRouter } from 'next/router'

import { clsx } from 'clsx'

import { CompanyLogo } from '@/components/company-logo'
import { SkipLink } from '@/components/skip-link'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { pathname } = useRouter()
  const { shaderVisible } = useProcessStore()
  useCartQuery()

  return pathname.startsWith(CHECKOUT_PAGE_PATH) ? (
    <div className="h-full min-h-screen bg-neutral-100">
      <div className="py-4">
        <header className="container mx-auto grid max-w-7xl grid-cols-3 items-center">
          <CompanyLogo size="lg" />
          <h1 className="h3 text-center !font-semibold">Checkout</h1>
        </header>
        <main className="container mx-auto max-w-7xl ">{children}</main>
      </div>
    </div>
  ) : (
    <div id="root-element">
      <SkipLink />
      <Header />

      <div
        className={clsx(
          'invisible fixed inset-0 z-10 max-h-screen bg-black opacity-0 transition-all',
          shaderVisible && '!visible opacity-50'
        )}
      />
      <main tabIndex={-1}>
        <div id="main">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
