/* eslint-disable import/order */
import { MouseEventHandler, useCallback, useMemo, useRef } from 'react'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { CloseButton, Drawer } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { Price } from '@/components/price'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCartOpen, useProcessStore } from '@/lib/stores/process'

import { Link } from '@/components/link'
import { useShareCartMutation } from '@/features/shared-cart/mutations/share-cart'
import { trackCheckoutBegin } from '@/lib/utils/gtm-util'
import { CartItem } from './cart-item'
import { Ticker } from './ticker'

const drawerClassNames = { body: 'h-full p-0', content: 'overflow-y-hidden' }

export const CartDrawer = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { cartOpen, toggleCartOpen } = useCartOpen()
  const { data: cart } = useCartQuery()
  const { isMutatingCart } = useProcessStore()
  const footerRef = useRef<HTMLDivElement | null>(null)
  const { mutate: shareCart, isLoading: isSharingCart } = useShareCartMutation()

  const handleShareCartClick = useCallback(() => {
    shareCart()
  }, [shareCart])

  const cartQuantity = useMemo(
    () => cart?.items?.reduce((prev, product) => prev + product.quantity, 0) || 0,
    [cart?.items]
  )

  const cartItems = useMemo(
    () =>
      cart?.items?.length
        ? cart.items.map(product => <CartItem key={product.sku} product={product} />)
        : undefined,
    [cart]
  )

  const subtotal =
    cart?.items?.reduce((total, item) => {
      const price = item.onSalePrice || item.price
      return price * (item.quantity || 1) + total
    }, 0) || 0
  const percentage = Math.round((subtotal / 150) * 100)
  const difference = 150 - subtotal

  const isCheckoutButtonDisabled = useMemo(
    () => cartItems === undefined || isMutatingCart || isSharingCart,
    [cartItems, isMutatingCart, isSharingCart]
  )

  const handleCheckoutClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    event => {
      event.preventDefault()
      const redirection = session?.user ? CHECKOUT_PAGE_PATH : SIGN_IN_PAGE_PATH

      router.push(
        session?.user ? redirection : `${redirection}?redirectTo=${CHECKOUT_PAGE_PATH}`,
        redirection
      )
      if (cart?.items !== undefined) {
        // Track either the user clicked on checkout button
        trackCheckoutBegin(cart?.items, subtotal)
      }
      toggleCartOpen()
    },
    [cart?.items, router, session?.user, subtotal, toggleCartOpen]
  )

  const handleGoShoppingClick = useCallback(() => {
    toggleCartOpen()
  }, [toggleCartOpen])

  return (
    <Drawer
      classNames={drawerClassNames}
      opened={cartOpen}
      position="right"
      withCloseButton={false}
      onClose={toggleCartOpen}
    >
      <div className="h-[inherit] overflow-y-hidden">
        <CloseButton className="absolute right-4 top-4 z-10" size="lg" onClick={toggleCartOpen} />
        <div
          className={`
            sticky left-0 top-0 flex w-full flex-col border-b border-base-dark bg-base-light pt-4
            lg:grid lg:grid-rows-[auto_1fr_auto]
          `}
        >
          <Typography as="h1" className="h4 text-center">
            Your Cart {cartQuantity === 0 ? undefined : `(${cartQuantity})`}
          </Typography>
          <div
            className={`
              grid w-full items-center`}
          >
            <div className="w-full space-y-1 px-4 text-center">
              {difference > 0 ? (
                <Typography>
                  You are {formatCurrency(difference)} away from{' '}
                  <Typography className="font-bold">FREE SHIPPING</Typography>
                </Typography>
              ) : (
                <Typography>
                  🎉 Cheers! You&apos;ve unlocked{' '}
                  <Typography className="font-bold">FREE SHIPPING</Typography>
                </Typography>
              )}

              <div className="mb-4 h-5 w-full rounded-full bg-neutral">
                <div
                  className="h-5 rounded-full bg-primary transition-[width]"
                  style={{ maxWidth: '100%', width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <Ticker />
            </div>
          </div>
        </div>
        <>
          {cartItems !== undefined ? (
            <div className="h-[stretch] overflow-y-scroll pb-[6.25rem]">
              <div className="mb-[6.25rem] divide-y divide-neutral-200 bg-neutral-50 px-4">
                {cartItems}
              </div>
            </div>
          ) : (
            <div
              className={`
                grid grid-cols-1 grid-rows-1 items-center justify-items-center px-4
                h-[calc(100dvh-12.9125rem)]
              `}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <Typography className="pb-2 text-lg">Your cart is empty!</Typography>
                <Link href={WINE_PAGE_PATH} onClick={handleGoShoppingClick}>
                  Go shopping
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
        </>
      </div>
      <div
        ref={footerRef}
        className={`
          sticky bottom-0 left-0 flex w-full items-center justify-between gap-10 border-t
          border-base-dark bg-base-light p-4
        `}
      >
        <div className="flex flex-col">
          <Typography>Subtotal</Typography>
          <Price price={subtotal || 0} subtext={false} />
        </div>
        <div className="space-x-2">
          <Button
            aria-disabled={isCheckoutButtonDisabled}
            color="ghost"
            disabled={isCheckoutButtonDisabled}
            variant="outline"
            onClick={handleShareCartClick}
          >
            Share cart
          </Button>
          <Button
            aria-disabled={isCheckoutButtonDisabled}
            disabled={isCheckoutButtonDisabled}
            onClick={handleCheckoutClick}
          >
            Checkout
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
