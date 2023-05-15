import { useCallback, useMemo } from 'react'

import { ShoppingCartIcon, UserIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Burger, Collapse } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { asText } from '@prismicio/helpers'
import { PrismicLink, PrismicRichText } from '@prismicio/react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
// eslint-disable-next-line import/order
import { useRouter } from 'next/router'
import { Badge, Indicator, Menu } from 'react-daisyui'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
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

export const Header = () => {
  const router = useRouter()
  const { toggleCartOpen } = useCartOpen()
  const { data: cart } = useCartQuery()
  const { data: navigation } = useNavigationQuery()
  const { data: promoMessage } = useNavigationPromoMessageQuery()
  const { data: cta } = useNavigationCTAQuery()
  const { data: session } = useSession()
  const [navOpen, { toggle: toggleNavOpen }] = useDisclosure(false)
  const burgerLabel = navOpen ? 'Close navigation' : 'Open navigation'
  const isDesktop = useIsDesktop()
  const queryClient = useQueryClient()

  const menu = useMemo(
    () =>
      navigation?.data.body !== undefined ? (
        <div className="flex flex-1 flex-col items-center text-lg lg:w-full lg:flex-row">
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
                className="inline-flex h-10 w-[stretch] items-center justify-center"
              >
                <PrismicLink field={link.primary.link}>{asText(link.primary.name)}</PrismicLink>
              </div>
            )
          })}
        </div>
      ) : (
        <></>
      ),
    [isDesktop, navigation?.data.body, toggleNavOpen]
  )

  const ctaButton = useMemo(
    () => (
      <Button
        className="mb-2 !bg-[#231f20] text-lg text-[#f5f3f2] lg:mb-0"
        color="ghost"
        fullWidth={!isDesktop}
      >
        {asText(cta?.data.button_text)}
      </Button>
    ),
    [cta?.data.button_text, isDesktop]
  )

  const handleUserClick = useCallback(() => {
    if (session?.user === undefined) {
      router.push(SIGN_IN_PAGE_PATH)
    }
  }, [router, session?.user])

  const userButton = useMemo(
    () => (
      <Menu horizontal className="p-0">
        <Menu.Item tabIndex={0}>
          <button className="flex items-center gap-1 p-0" onClick={handleUserClick}>
            <UserIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            <Typography>
              {session?.user !== undefined ? `Hi, ${session.user.name.first}` : 'Sign in'}
            </Typography>
            {session?.user !== undefined ? <ChevronDownIcon className="h-4 w-4" /> : undefined}
          </button>

          {session?.user !== undefined ? (
            <Menu className="rounded border border-[#e6e0dd] bg-[#f5f3f2] p-2 shadow">
              <Menu.Item>
                <button className="!rounded">My Account</button>
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
    ),
    [handleUserClick, queryClient, session?.user]
  )

  const cartQuantity =
    useMemo(() => cart?.items.reduce((prev, item) => item.quantity + prev, 0), [cart?.items]) || 0

  const cartBadge = useMemo(
    () => (
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
          <PrismicRichText field={promoMessage?.data.feature_bar} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Typography>Shopping with a consultant?</Typography>
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
              <div className="flex w-full items-center">
                <CompanyLogo />
                <div className="flex flex-1">
                  {menu}
                  <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                    <MagnifyingGlassIcon className="h-6 w-6 stroke-[3]" />
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
