'use client'

import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import { ShoppingCartIcon, UserIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Burger, Collapse, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { asText } from '@prismicio/helpers'
import { PrismicLink, PrismicRichText } from '@prismicio/react'
import { useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'
import { Badge, Indicator, Menu } from 'react-daisyui'

import { CompanyLogo } from '@/components/company-logo'
import { Link } from '@/components/link'
import { Search } from '@/components/search'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANTS_PAGE_PATH, MY_ACCOUNT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'
import {
  useNavigationCTAQuery,
  useNavigationPromoMessageQuery,
  useNavigationQuery,
} from '@/lib/queries/header'
import { useCartOpen } from '@/lib/stores/process'
import { signOut } from '@/lib/utils/sign-out'

import { StatePicker } from '../state-picker'

import { CartDrawer } from './cart-drawer'
import { NavigationItem } from './navigation/item'
import { SearchNew } from './search'

export const Header = () => {
  const router = useRouter()
  const { toggleCartOpen } = useCartOpen()
  const { data: cart } = useCartQuery()
  const {
    data: navigation,
    isFetching: isFetchingNavigation,
    isLoading: isLoadingNavigation,
  } = useNavigationQuery()
  const {
    data: promoMessage,
    isFetching: isFetchingPromoMessage,
    isLoading: isLoadingPromoMessage,
  } = useNavigationPromoMessageQuery()
  const { data: cta, isFetching: isFetchingCTA, isLoading: isLoadingCTA } = useNavigationCTAQuery()
  const { data: session } = useSession()
  const [navOpen, { toggle: toggleNavOpen }] = useDisclosure(false)
  const burgerLabel = navOpen ? 'Close navigation' : 'Open navigation'
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()
  const { data: consultant } = useConsultantQuery()

  const menu = useMemo(
    () =>
      !isFetchingNavigation && !isLoadingNavigation ? (
        <div className="flex flex-col items-center gap-2 text-lg lg:flex-row lg:justify-evenly [&>*]:p-2 [&>*]:!tracking-[1px] [&>*]:lg:m-[0.625rem]">
          {navigation?.data.body?.map(link => {
            const hasChildren =
              link.items.length > 0 &&
              link.items.some(
                child => child.child_link.link_type !== 'Any' && 'url' in child.child_link
              )

            if (hasChildren) {
              return (
                <NavigationItem
                  key={link.id}
                  data={link}
                  isDesktop={isDesktop}
                  onLinkClick={toggleNavOpen}
                />
              )
            }

            return (
              <div
                key={link.id}
                className={clsx(
                  'inline-flex w-[stretch] items-start justify-center transition-all duration-100 hover:border-b-4 hover:border-[#231f20] lg:mb-1 lg:h-12',
                  link.primary.bold && 'font-bold'
                )}
              >
                <PrismicLink
                  className="w-max text-neutral-dark hover:no-underline"
                  field={link.primary.link}
                  onClick={toggleNavOpen}
                >
                  {asText(link.primary.name)}
                </PrismicLink>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center text-lg lg:w-full lg:flex-row">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ),
    [isDesktop, isFetchingNavigation, isLoadingNavigation, navigation?.data.body, toggleNavOpen]
  )

  const ctaButton = useMemo(
    () =>
      !isFetchingCTA && !isLoadingCTA ? (
        <Button
          className="mb-2 !bg-[#864f4f] text-lg text-[#f5f3f2] lg:mb-0 lg:w-max"
          color="ghost"
          fullWidth={!isDesktop}
        >
          {asText(cta?.data.button_text)}
        </Button>
      ) : (
        <Skeleton className="h-12 w-[13.75rem]" />
      ),
    [cta?.data.button_text, isDesktop, isFetchingCTA, isLoadingCTA]
  )

  const handleUserClick = useCallback(() => {
    if (session?.user !== undefined && session.user.isGuest) {
      signOut(queryClient, false)
      router.push(SIGN_IN_PAGE_PATH)
    }

    if (session?.user === undefined) {
      router.push(SIGN_IN_PAGE_PATH)
    }
  }, [queryClient, router, session?.user])

  const userButton = useMemo(
    () =>
      !isFetchingNavigation && !isLoadingNavigation ? (
        <Menu horizontal className="p-0">
          <Menu.Item tabIndex={0}>
            <button className="flex items-center gap-1 rounded p-1" onClick={handleUserClick}>
              <UserIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              <Typography>
                {session?.user !== undefined && !session.user.isGuest
                  ? `Hi, ${session.user.name.first}`
                  : 'Sign in'}
              </Typography>
              {session?.user !== undefined && !session.user.isGuest ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : undefined}
            </button>

            {session?.user !== undefined && !session.user.isGuest ? (
              <Menu className="rounded border border-[#e6e0dd] bg-[#f5f3f2] p-2 shadow">
                <Menu.Item>
                  <button className="!rounded" onClick={() => router.push(MY_ACCOUNT_PAGE_PATH)}>
                    My Account
                  </button>
                </Menu.Item>
                <Menu.Item>
                  <button className="!rounded" onClick={() => signOut(queryClient)}>
                    Sign out
                  </button>
                </Menu.Item>
              </Menu>
            ) : undefined}
          </Menu.Item>
        </Menu>
      ) : (
        <Skeleton className="h-3 w-36" />
      ),
    [handleUserClick, isFetchingNavigation, isLoadingNavigation, queryClient, router, session?.user]
  )

  const cartQuantity =
    useMemo(() => cart?.items.reduce((prev, item) => item.quantity + prev, 0), [cart?.items]) || 0

  const cartBadge = useMemo(
    () =>
      cartQuantity === 0 ? undefined : (
        <Badge className="bg-[#181818]" size="sm">
          {cartQuantity}
        </Badge>
      ),
    [cartQuantity]
  )

  return (
    <header className="z-20 h-max bg-[#e6e0dd] text-neutral-900">
      <div className="container mx-auto flex flex-col items-center justify-between space-y-1 py-2 lg:flex-row">
        <StatePicker />
        <div className="text-14">
          {isFetchingPromoMessage || isLoadingPromoMessage ? (
            <Skeleton className="h-11 w-80 lg:h-5" />
          ) : (
            <strong>
              <PrismicRichText field={promoMessage?.data.feature_bar} />
            </strong>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <Link
            className="!text-neutral-dark"
            href={
              consultant?.displayId !== CORPORATE_CONSULTANT_ID
                ? `${CONSULTANTS_PAGE_PATH}/${consultant?.url}`
                : CONSULTANTS_PAGE_PATH
            }
          >
            {consultant?.displayId !== CORPORATE_CONSULTANT_ID ? (
              <div>
                <Typography className="text-sm">Shopping with: </Typography>
                <Typography className="text-14">
                  {consultant?.displayName || consultant?.url}
                </Typography>
              </div>
            ) : (
              'Shopping with a consultant?'
            )}
          </Link>
          <div className="flex items-center gap-4">
            {userButton}
            <button onClick={toggleCartOpen}>
              <Indicator item={cartBadge}>
                <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </Indicator>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#f5f3f2]">
        <div className="container mx-auto flex items-center justify-between py-3 lg:w-full">
          {isDesktop ? (
            <>
              <div className="flex w-full items-center gap-4">
                <CompanyLogo />
                <div className="flex flex-1 lg:justify-end">
                  {menu}
                  <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                    {!isFetchingNavigation && !isLoadingNavigation ? (
                      <SearchNew />
                    ) : (
                      <Skeleton className="h-8 w-8" />
                    )}
                    {ctaButton}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <CompanyLogo />
              <Burger aria-label={burgerLabel} opened={navOpen} onClick={toggleNavOpen} />
            </>
          )}
        </div>
        {isDesktop ? undefined : (
          <Collapse in={navOpen}>
            {menu}
            <Search id="navigation-search" />
            <div className="container mx-auto">{ctaButton}</div>
          </Collapse>
        )}
      </div>
      <CartDrawer />
    </header>
  )
}
