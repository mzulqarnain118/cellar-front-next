import { ReactNode, useEffect } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const router = useRouter()

  // Load user consultant if consultant not defined for session
  useEffect(() => {
    const u = localStorage.getItem('u')
    if (
      session?.user?.userConsultantData?.url &&
      session?.user.userConsultantData.displayId !== '1001' &&
      (u === undefined || u === null || u === '') &&
      router.isReady
    ) {
      router.query.u = session?.user?.userConsultantData?.url
      router.replace(router)
    }
  }, [session?.user.userConsultantData, router?.isReady])

  return (
    <div className="relative h-full min-h-[100svh] bg-[#f7f3f4]">
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
