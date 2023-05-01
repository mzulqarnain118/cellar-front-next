import { useEffect } from 'react'

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'

import { useSetCartOwnerMutation } from '@/lib/mutations/cart/set-owner'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

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
  const { mutate: setCartOwner } = useSetCartOwnerMutation()
  const { data: cart } = useCartQuery()

  useEffect(() => {
    if (cart !== undefined) {
      setCartOwner()
    }
  }, [cart, setCartOwner])

  return (
    <>
      <NextSeo title="Checkout" />
    </>
  )
}

export default CheckoutPage
