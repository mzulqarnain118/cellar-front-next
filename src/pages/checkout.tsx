import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'

import { AccountDetails } from '@/features/checkout/account-details'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'

import { authOptions } from './api/auth/[...nextauth]'

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

const CheckoutPage: NextPage<PageProps> = () => (
  <>
    <NextSeo title="Checkout" />
    <div className="mt-10 grid grid-cols-[2fr_1fr] gap-10">
      <div className="">
        <AccountDetails />
      </div>
      <div className="rounded border border-neutral-300 bg-neutral-50 p-6">
        <h5>Order Summary</h5>
        <div className="grid auto-rows-auto grid-cols-2 items-center">
          <span>Subtotal</span>
          <span className="text-right">$1.00</span>
        </div>
        <div className="grid auto-rows-auto grid-cols-2 items-center">
          <span>Shipping</span>
          <span className="text-right">$1.00</span>
        </div>
        <div className="grid auto-rows-auto grid-cols-2 items-center">
          <span>Tax</span>
          <span className="text-right">$1.00</span>
        </div>
      </div>
    </div>
  </>
)

export default CheckoutPage
