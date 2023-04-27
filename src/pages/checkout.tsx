import { useEffect } from 'react'

import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'

import { Tabs, rem } from '@mantine/core'

import { Delivery } from '@/features/checkout/delivery'
import { Tab } from '@/features/checkout/tab'
import { useSetCartOwnerMutation } from '@/lib/mutations/cart/set-owner'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutActions, useCheckoutTabs } from '@/lib/stores/checkout'

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

const tabsStyles = {
  tabLabel: {
    fontSize: rem(16),
  },
}

const CheckoutPage: NextPage<PageProps> = () => {
  const { setActiveTab } = useCheckoutActions()
  const { activeTab, completedTabs } = useCheckoutTabs()
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
      <Tabs
        orientation="horizontal"
        styles={tabsStyles}
        value={activeTab}
        onTabChange={setActiveTab}
      >
        <Tabs.List>
          <Tab
            active={activeTab === 'delivery'}
            complete={completedTabs.some(tab => tab === 'delivery')}
            value="delivery"
          />
          <Tab
            active={activeTab === 'shipping'}
            complete={completedTabs.some(tab => tab === 'shipping')}
            disabled={!completedTabs.some(tab => tab === 'delivery')}
            value="shipping"
          />
          <Tab
            active={activeTab === 'payment'}
            complete={completedTabs.some(tab => tab === 'payment')}
            disabled={!completedTabs.some(tab => tab === 'shipping')}
            value="payment"
          />
        </Tabs.List>

        <Tabs.Panel value="delivery">
          <Delivery />
        </Tabs.Panel>

        <Tabs.Panel value="shipping">Shipping</Tabs.Panel>

        <Tabs.Panel value="payment">Payment</Tabs.Panel>
      </Tabs>
    </>
  )
}

export default CheckoutPage
