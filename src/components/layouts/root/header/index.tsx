'use client'

import { useCallback, useMemo } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { ShoppingCartIcon, UserIcon } from '@heroicons/react/20/solid'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Burger, Collapse, Popover, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { asText } from '@prismicio/helpers'
import { PrismicLink, PrismicRichText } from '@prismicio/react'
import { useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'
import { Badge, Indicator, Menu } from 'react-daisyui'

import { BlurImage } from '@/components/blur-image'
import { CompanyLogo } from '@/components/company-logo'
import { Price } from '@/components/price'
import { Search } from '@/components/search'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { useCuratedCartQuery } from '@/features/curated-cart/queries/curated-cart'
import { MY_ACCOUNT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useGetCartInfoQuery } from '@/lib/queries/get-info'
import {
  useNavigationCTAQuery,
  useNavigationPromoMessageQuery,
  useNavigationQuery,
} from '@/lib/queries/header'
import { useProductsQuery } from '@/lib/queries/products'
import { useCuratedCartStore } from '@/lib/stores/curated-cart'
import { useCartOpen } from '@/lib/stores/process'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart } from '@/lib/types'
import { signOut } from '@/lib/utils/sign-out'

import { StatePicker } from '../state-picker'

import { CartDrawer } from './cart-drawer'
import { Consultant } from './consultant'
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
  const { curatedCart, dismissCart, setCuratedCart } = useCuratedCartStore()
  const { data: curatedCartData } = useCuratedCartQuery()
  const { data: products } = useProductsQuery()
  const { data: cartInfo } = useGetCartInfoQuery(
    curatedCart !== undefined && curatedCart.cartId.length > 0 ? curatedCart.cartId : undefined
  )
  const { shippingState } = useShippingStateStore()

  const menu = useMemo(
    () =>
      !isFetchingNavigation && !isLoadingNavigation ? (
        <div className="flex flex-col items-center text-lg lg:flex-row lg:justify-evenly [&>*]:p-2 [&>*]:!tracking-[1px] [&>*]:lg:m-[0.625rem]">
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
                  'inline-flex w-[stretch] items-center justify-center transition-all duration-100 hover:border-b-4 hover:border-[#231f20] lg:mb-1 lg:h-12',
                  link.primary.bold && 'font-bold'
                )}
              >
                <PrismicLink
                  className="xl:w-max text-neutral-dark hover:no-underline"
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
        <Link href={cta?.data.link || cta?.data.uid}>
          <Button
            className="mb-2 !bg-[#085250] text-lg text-[#f5f3f2] lg:mb-0 2xl:w-max !text-wrap"
            color="ghost"
            fullWidth={!isDesktop}
          >
            {asText(cta?.data.button_text)}
          </Button>
        </Link>
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
                  <button
                    className="!rounded"
                    onClick={() => router.push(`${MY_ACCOUNT_PAGE_PATH}/profile`)}
                  >
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

  const handleNotNow = useCallback(() => {
    dismissCart()
  }, [dismissCart])

  const handleUseCart = useCallback(() => {
    if (cartInfo !== undefined) {
      queryClient.setQueryData<Cart>(
        [...CART_QUERY_KEY, shippingState.provinceID || session?.user?.shippingState.provinceID],
        {
          discounts: [],
          id: curatedCart?.cartId || '',
          isCuratedCart: true,
          isSharedCart: false,
          isVipCart: false,
          items:
            cartInfo?.OrderLines.map(item => {
              const product = products?.find(
                productData => productData?.sku === item?.ProductSKU?.toLowerCase()
              )
              return {
                ...product,
                cartUrl: product?.cartUrl || '',
                catalogId: 0,
                displayCategories: product?.displayCategories || [],
                displayName: item.ProductDisplayName,
                isAutoSip: product?.isAutoSip || false,
                isClubOnly: product?.isClubOnly || false,
                isGift: product?.isGift || false,
                isGiftCard: product?.isGiftCard || false,
                isScoutCircleClub: product?.isScoutCircleClub || false,
                isVip: product?.isVip || false,
                onSalePrice: item.DisplayPrice,
                orderId: item.OrderID,
                orderLineId: item.OrderLineID,
                price: item.Price,
                quantity: item.Quantity,
                quantityAvailable: product?.quantityAvailable || 0,
                sku: item.ProductSKU.toLowerCase(),
                subscribable: product?.subscribable || false,
              }
            }).filter(Boolean) || [],
          orderDisplayId: cartInfo?.DisplayID,
          prices: {
            orderTotal: 0,
            retailDeliveryFee: 0,
            shipping: 0,
            subtotal: 0,
            subtotalAfterSavings: 0,
            tax: 0,
          },
        }
      )
      if (curatedCart !== undefined) {
        setCuratedCart({ ...curatedCart, cartAccepted: true, messageDismissed: true })
      }
      toggleCartOpen()
    }
  }, [
    cartInfo,
    curatedCart,
    products,
    queryClient,
    session?.user?.shippingState.provinceID,
    setCuratedCart,
    shippingState.provinceID,
    toggleCartOpen,
  ])

  const cartButton = useMemo(
    () =>
      curatedCart !== undefined &&
        curatedCart.cartId.length > 0 &&
        !curatedCart.messageDismissed ? (
        <Popover
          withArrow
          arrowPosition="side"
          opened={!!curatedCartData && curatedCartData.CartID.length > 0}
          position="top-end"
          shadow="md"
          width={380}
        >
          <Popover.Target>
            <button onClick={toggleCartOpen}>
              <Indicator item={cartBadge}>
                <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </Indicator>
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <Typography as="h6" className="!text-14 !leading-normal !mb-4">
              Hooray! Your Consultant has recommended a cart for you. Click on &apos;Use Cart&apos;
              to proceed, or &apos;Not Now&apos; to save it for another day. Once you proceed, you
              can add or modify this cart too! And, don&apos;t worry, if now is not the time, this
              cart will be available to you for a few more days.
            </Typography>
            <div className="divide-y divide-y-neutral-light">
              {cartInfo?.OrderLines.map(item => (
                <div key={item.ProductSKU} className="grid grid-cols-[auto_1fr] items-center py-2">
                  <div className="relative w-24 h-24">
                    <BlurImage
                      fill
                      alt={item.ProductDisplayName}
                      className="object-contain"
                      sizes="100vw"
                      src={item.ProductImage}
                    />
                  </div>
                  <div>
                    <Typography>{item.ProductDisplayName}</Typography>
                    <Price price={item.Price} onSalePrice={item.DisplayPrice} />
                    <Typography>QTY: {item.Quantity}</Typography>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <Button color="ghost" size="sm" onClick={handleNotNow}>
                Not now
              </Button>
              <Button dark size="sm" onClick={handleUseCart}>
                Use cart
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      ) : (
        <button onClick={toggleCartOpen}>
          <Indicator item={cartBadge}>
            <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
          </Indicator>
        </button>
      ),
    [
      cartBadge,
      cartInfo?.OrderLines,
      curatedCart,
      curatedCartData,
      handleNotNow,
      handleUseCart,
      toggleCartOpen,
    ]
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
          <Consultant />
          <div className="flex items-center gap-4">
            {userButton}
            {cartButton}
          </div>
        </div>
      </div>
      <div className="bg-[#f5f3f2]">
        <div className="2xl:container mx-auto flex items-center xl:overflow-hidden  lg:pr-3 justify-between py-3 lg:w-full">
          {isDesktop ? (
            <>
              <div className="flex w-full items-center">
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
