import { useEffect } from 'react'

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'

import { useSession } from 'next-auth/react'

import { Typography } from '@/core/components/typogrpahy'
import { CartSummary } from '@/features/checkout/cart-summary'
import { ContactInformation } from '@/features/checkout/contact-information'
import { Delivery } from '@/features/checkout/delivery'
import { Payment } from '@/features/checkout/payment'
import { useSetCartOwnerMutation } from '@/lib/mutations/cart/set-owner'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutActions } from '@/lib/stores/checkout'

import { authOptions } from '../api/auth/[...nextauth]'

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: SIGN_IN_PAGE_PATH,
        permanent: false,
      },
    }
  }

  return {
    props: {
      session: session.user,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const CheckoutPage: NextPage<PageProps> = () => {
  const { data: session } = useSession()
  const { mutate: setCartOwner } = useSetCartOwnerMutation()
  const { data: cart } = useCartQuery()
  const { setActiveTab, setCompletedTabs } = useCheckoutActions()

  useEffect(() => {
    if (cart !== undefined) {
      setCartOwner()
    }
  }, [cart, setCartOwner])

  useEffect(() => {
    if (session?.user === undefined) {
      setActiveTab('contact-information')
    } else {
      setActiveTab('delivery')
      setCompletedTabs(prev => [...prev, 'contact-information'])
    }
  }, [session?.user, setActiveTab, setCompletedTabs])

  return (
    <>
      <NextSeo title="Checkout" />
      <div className="mt-8 flex flex-col-reverse rounded lg:flex-row">
        <div className="flex-1 space-y-6 rounded">
          <ContactInformation />
          <Delivery />
          <Payment />
        </div>
        <div className="flex-1">
          <div className="mx-auto w-max rounded border border-base-dark bg-neutral-50 p-4">
            <Typography
              noSpacing
              as="h2"
              className="!font-body !text-lg !font-bold lg:!text-2xl"
              displayAs="h4"
            >
              Your cart
            </Typography>
            <CartSummary />
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
