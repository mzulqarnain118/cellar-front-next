import { ElementType, useCallback } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

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

import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { Profile } from '@/features/customer-portal/components/profile'
import {
  CUSTOMER_PORTAL_BANNER_QUERY_KEY,
  getCustomerPortalBanner,
  useCustomerPortalBanner,
} from '@/features/customer-portal/queries/banner'
import { useCustomerPortalIsLoading } from '@/features/store'
import { MY_ACCOUNT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'

import { authOptions } from '../api/auth/[...nextauth]'

const SLUGS = [
  'profile',
  'shipping-addresses',
  'payment-methods',
  'orders',
  'clubs',
  'auto-sips',
  'wallet',
]

const slugMap: Record<string, string> = {
  'auto-sips': 'Auto-Sips',
  clubs: 'Clubs',
  orders: 'Orders',
  'payment-methods': 'Payment Methods',
  profile: 'Profile',
  'shipping-addresses': 'Shipping Addresses',
  wallet: 'Wallet',
}

const iconMap: Record<string, ElementType> = {
  'auto-sips': TruckIcon,
  clubs: StarIcon,
  orders: ShoppingBagIcon,
  'payment-methods': CreditCardIcon,
  profile: UserIcon,
  'shipping-addresses': MapPinIcon,
  wallet: WalletIcon,
}

const panelMap: Record<string, ElementType> = {
  'auto-sips': Profile,
  clubs: Profile,
  orders: Profile,
  'payment-methods': Profile,
  profile: Profile,
  'shipping-addresses': Profile,
  wallet: Profile,
}

const tabsClassNames = {
  tab: 'px-4 py-2',
  tabLabel: 'text-base',
}

export const getServerSideProps: GetServerSideProps = async context => {
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
  const friendlyName = slugMap[slug || '']
  const isLoading = useCustomerPortalIsLoading()

  const handleTabChange: TabsProps['onTabChange'] = useCallback(
    (value: string) => push(`${MY_ACCOUNT_PAGE_PATH}/${value}`, undefined, { shallow: true }),
    [push]
  )

  return (
    <main className="bg-[#f7f3f4]">
      <LoadingOverlay visible={isLoading} />
      <div className="container mx-auto py-20">
        <div className="grid pb-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <Typography as="h1" className="hidden !leading-tight lg:block" displayAs="h3">
            {friendlyName}
          </Typography>
          {banner?.imageUrl ? (
            <Image
              alt={banner.title || 'Customer portal banner'}
              className="object-contain"
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
          <Tabs.List position="center">
            {SLUGS.map(url => {
              const Icon = iconMap[url]

              return (
                <Tabs.Tab
                  key={url}
                  className="h-14"
                  color="dark"
                  icon={<Icon className="mr-3 h-5 w-5" />}
                  value={url}
                >
                  {slugMap[url]}
                </Tabs.Tab>
              )
            })}
          </Tabs.List>

          {SLUGS.map(url => {
            const Panel = panelMap[url]
            return (
              <Panel key={url} className="px-6" value={url}>
                {url}
              </Panel>
            )
          })}
        </Tabs>
      </div>
    </main>
  )
}

export default MyAccountPage
