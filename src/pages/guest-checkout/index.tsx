import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'

import { GuestCheckout } from '@/features/guest-checkout'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'

import { authOptions } from '../api/auth/[...nextauth]'

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session?.user?.isGuest) {
    return {
      redirect: {
        destination: CHECKOUT_PAGE_PATH,
        permanent: false,
      },
    }
  }

  return {
    props: {
      session: null,
    },
  }
}

const GuestCheckoutPage = () => <GuestCheckout />

export default GuestCheckoutPage
