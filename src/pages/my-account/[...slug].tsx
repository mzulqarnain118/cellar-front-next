import { ElementType, useCallback } from 'react'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Script from 'next/script'

import {
  CreditCardIcon,
  MapPinIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import { LoadingOverlay, Tabs, TabsProps } from '@mantine/core'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'

import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { Clubs } from '@/features/customer-portal/components/clubs'
import { ClubsEdit } from '@/features/customer-portal/components/clubs/edit'
import { PaymentMethods } from '@/features/customer-portal/components/payment-methods'
import { Profile } from '@/features/customer-portal/components/profile'
import { ShippingAddresses } from '@/features/customer-portal/components/shipping-addresses'
import { Wallet } from '@/features/customer-portal/components/wallet'
import {
  CUSTOMER_PORTAL_BANNER_QUERY_KEY,
  getCustomerPortalBanner,
  useCustomerPortalBanner,
} from '@/features/customer-portal/queries/banner'
import { useCustomerPortalIsLoading } from '@/features/store'
import { MY_ACCOUNT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'

import { authOptions } from '../api/auth/[...nextauth]'

const OrderInvoicePanel = dynamic(() =>
  import('@/features/customer-portal/components/orders/invoice').then(
    ({ OrderInvoicePanel }) => OrderInvoicePanel
  )
)

const Orders = dynamic(() =>
  import('@/features/customer-portal/components/orders').then(({ Orders }) => Orders)
)

const SLUGS = [
  'profile',
  'shipping-addresses',
  'payment-methods',
  'orders',
  'clubs',
  'auto-sips',
  'wallet',
]

interface Slug {
  friendlyName: string
  icon: ElementType
  panel: ElementType
}

const slugMap: Record<string, Slug> = {
  'auto-sips': {
    friendlyName: 'Auto-Sips',
    icon: TruckIcon,
    panel: Clubs,
  },
  clubs: {
    friendlyName: 'Clubs',
    icon: StarIcon,
    panel: Clubs,
  },
  orders: {
    friendlyName: 'Orders',
    icon: ShoppingBagIcon,
    panel: Orders,
  },
  'payment-methods': {
    friendlyName: 'Payment Methods',
    icon: CreditCardIcon,
    panel: PaymentMethods,
  },
  profile: {
    friendlyName: 'Profile',
    icon: UserIcon,
    panel: Profile,
  },
  'shipping-addresses': {
    friendlyName: 'Shipping Addresses',
    icon: MapPinIcon,
    panel: ShippingAddresses,
  },
  wallet: {
    friendlyName: 'Wallet',
    icon: WalletIcon,
    panel: Wallet,
  },
}

const tabsClassNames = {
  tab: 'px-4 py-2',
  tabLabel: 'text-base',
}

export const getServerSideProps: GetServerSideProps = async context => {
  const SLUGS = [
    'profile',
    'shipping-addresses',
    'payment-methods',
    'orders',
    'clubs',
    'auto-sips',
    'wallet',
  ]

  const slug = context.query[0]?.toString()

  if (slug !== undefined && !SLUGS.includes(slug)) {
    return {
      notFound: true,
    }
  }

  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: SIGN_IN_PAGE_PATH,
        permanent: false,
        source: MY_ACCOUNT_PAGE_PATH,
      },
    }
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(CUSTOMER_PORTAL_BANNER_QUERY_KEY, getCustomerPortalBanner)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      session: session.user,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const MyAccountPage: NextPage<PageProps> = () => {
  const isDesktop = useIsDesktop()
  const { data: banner } = useCustomerPortalBanner()
  const { push, query } = useRouter()
  const slug = query.slug?.[0]
  const friendlyName = slugMap[slug || '']?.friendlyName
  const isLoading = useCustomerPortalIsLoading()

  const handleTabChange: TabsProps['onTabChange'] = useCallback(
    (value: string) => push(`${MY_ACCOUNT_PAGE_PATH}/${value}`, undefined, { shallow: true }),
    [push]
  )

  return (
    <>
      <NextSeo nofollow noindex title="My account" />
      <main className="bg-[#f7f3f4]">
        <Script
          id="brightback"
          src="https://app.brightback.com/js/current/brightback.js?compiled=true"
        />
        <LoadingOverlay visible={isLoading} />
        <div className="container mx-auto py-20">
          <div className="grid pb-4 lg:grid-cols-12 lg:items-center">
            <Typography
              as="h1"
              className="hidden !leading-tight lg:col-span-3 lg:block"
              displayAs="h3"
            >
              {friendlyName}
            </Typography>
            {banner?.imageUrl ? (
              <Image
                alt={banner.title || 'Customer portal banner'}
                className="object-contain lg:col-span-9"
                height={isDesktop ? 146 : 88}
                src={banner.imageUrl}
                width={isDesktop ? 1012 : 609}
              />
            ) : undefined}
          </div>
          <Tabs
            classNames={tabsClassNames}
            defaultValue={slug}
            keepMounted={false}
            orientation={isDesktop ? 'vertical' : 'horizontal'}
            variant="pills"
            onTabChange={handleTabChange}
          >
            <Tabs.List position={isDesktop ? undefined : 'center'}>
              {SLUGS.map(url => {
                const Icon = slugMap[url].icon

                return (
                  <Tabs.Tab
                    key={url}
                    className="h-14 w-[17.5rem]"
                    color="dark"
                    icon={<Icon className="mr-3 h-5 w-5" />}
                    value={url}
                  >
                    {slugMap[url].friendlyName}
                  </Tabs.Tab>
                )
              })}
            </Tabs.List>

            {SLUGS.map(url => {
              const Panel = slugMap[url].panel

              if (query.slug !== undefined && query.slug.length > 1) {
                if (url === 'orders' && query.slug[2] === 'invoice') {
                  return (
                    <OrderInvoicePanel key="orders-invoice" className="lg:px-20" value="orders">
                      {url}
                    </OrderInvoicePanel>
                  )
                } else if ((url === 'clubs' || url === 'auto-sips') && query.slug[2] === 'edit') {
                  return (
                    <ClubsEdit
                      key={`${url}-edit`}
                      autoSip={url === 'auto-sips'}
                      className="lg:px-20"
                      value={url}
                    >
                      {url}
                    </ClubsEdit>
                  )
                }
              }

              return (
                url === slug && (
                  <Panel key={url} autoSip={url === 'auto-sips'} className="lg:px-20" value={url}>
                    {url}
                  </Panel>
                )
              )
            })}
          </Tabs>
        </div>
      </main>
    </>
  )
}

export default MyAccountPage
