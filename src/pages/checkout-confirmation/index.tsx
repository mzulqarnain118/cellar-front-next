import { useEffect } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'

import { NextPage } from 'next'
import { signOut, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'

import { BlurImage } from '@/components/blur-image'
import { Typography } from '@/core/components/typogrpahy'
import { CHECKOUT_CONFIRMATION_PAGE_PATH } from '@/lib/paths'

const Receipt = dynamic(
  () => import('@/features/checkout/components/receipt').then(({ Receipt }) => Receipt),
  { ssr: false }
)

const CheckoutConfirmationPage: NextPage = () => {
  const { data: session } = useSession()

  useEffect(() => {
    const signOutGuest = async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('checkout')
      }

      if (session?.user?.isGuest) {
        await signOut({ callbackUrl: CHECKOUT_CONFIRMATION_PAGE_PATH, redirect: false })
      }
    }
    signOutGuest()
  }, [session?.user?.isGuest])

  return (
    <>
      <NextSeo />
      <main>
        <div className="bg-[#f5f4f2]">
          <div className="container mx-auto flex flex-col items-center justify-center pb-20">
            <div className="flex flex-col items-center justify-center space-y-4">
              <BlurImage alt="Enjoy" height={91} src="/enjoy.png" width={250} />
              <Typography as="h1" displayAs="h4">
                Your Clean-Crafted™ product is on the way
              </Typography>
              <Typography as="p" className="max-w-sm text-center text-14">
                Thank you for joining us on the journey to discover the unknown good. Your
                Clean-Crafted™ product is on its way. You can view your order confirmation below.
                Have questions or need some assistance? You can reach us at{' '}
                <Link href="email:hello@scoutandcellar.com">hello@scoutandcellar.com</Link>.
              </Typography>
            </div>
            <Receipt />
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutConfirmationPage
