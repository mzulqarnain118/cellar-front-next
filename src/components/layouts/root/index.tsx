/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react'

import { useRouter } from 'next/router'

import { Steps } from 'react-daisyui'

import { CompanyLogo } from '@/components/company-logo'
import { SkipLink } from '@/components/skip-link'
import { Typography } from '@/core/components/typogrpahy'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutTabs } from '@/lib/stores/checkout'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { activeTab, completedTabs } = useCheckoutTabs()
  const { pathname } = useRouter()
  const contactInfoActive =
    activeTab === 'contact-information' || completedTabs.includes('contact-information')
  const deliveryActive = activeTab === 'delivery' || completedTabs.includes('delivery')
  const paymentActive = activeTab === 'payment' || completedTabs.includes('payment')
  useCartQuery()

  return pathname.startsWith(CHECKOUT_PAGE_PATH) ? (
    <div className="h-full min-h-screen bg-[#f7f3f4]">
      <div className="py-4">
        <header className="container mx-auto flex items-center justify-between">
          <CompanyLogo size="lg" />
          <Steps>
            <Steps.Step color={contactInfoActive ? 'primary' : undefined}>
              Contact information
            </Steps.Step>
            <Steps.Step color={deliveryActive ? 'primary' : undefined}>Delivery</Steps.Step>
            <Steps.Step color={paymentActive ? 'primary' : undefined}>Payment</Steps.Step>
          </Steps>
          <Typography as="h1" className="!m-0 !p-0" displayAs="h2">
            Checkout
          </Typography>
        </header>
        <main className="container mx-auto">{children}</main>
      </div>
    </div>
  ) : (
    <div className="min-h-[100svh]" id="root-element">
      <SkipLink />
      <Header />

      <main tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
