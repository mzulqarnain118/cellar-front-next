import { ReactNode } from 'react'

import dynamic from 'next/dynamic'

import { CompanyLogo } from '@/components/company-logo'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'

const CheckoutSteps = dynamic(() => import('./steps').then(module => module.CheckoutSteps), {
  ssr: false,
})

interface CheckoutLayoutProps {
  children: ReactNode
}

export const CheckoutLayout = ({ children }: CheckoutLayoutProps) => {
  const isDesktop = useIsDesktop()

  return (
    <div className="h-full min-h-[100svh] bg-[#f7f3f4]">
      <div className="min-h-[100svh] py-4">
        <header className="container mx-auto flex items-center justify-between">
          <CompanyLogo size="lg" />
          {isDesktop ? <CheckoutSteps /> : undefined}
          <Typography as="h1" className="!m-0 !p-0" displayAs="h2">
            Checkout
          </Typography>
        </header>
        {isDesktop ? undefined : <CheckoutSteps />}
        <main className="container mx-auto">{children}</main>
      </div>
    </div>
  )
}
