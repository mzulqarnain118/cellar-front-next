/* eslint-disable */

import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { CloseButton, Drawer } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { Price } from '@/components/price'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { WINE_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCartOpen, useProcessStore } from '@/lib/stores/process'

import { Link } from '@/components/link'
import { useValidateCartStockMutation } from '@/features/checkout/mutations/validate-cart-stock'
import { useShareCartMutation } from '@/features/shared-cart/mutations/share-cart'
import { CartItem } from './cart-item'
import { Ticker } from './ticker'

const drawerClassNames = { body: 'h-full p-0', content: 'overflow-y-hidden' }

export const CartDrawer = () => {
  const [scrollHeight, setScrollHeight] = useState(0)
  const { data: session } = useSession()
  const router = useRouter()
  const { cartOpen, toggleCartOpen } = useCartOpen()
  const { data: cart } = useCartQuery()
  const { isMutatingCart } = useProcessStore()
  const footerRef = useRef({} as HTMLDivElement)
  const drawerHeaderRef = useRef({} as HTMLDivElement)
  const { mutate: shareCart, isLoading: isSharingCart } = useShareCartMutation()
  const { mutate: vaildateCartStock } = useValidateCartStockMutation()

  /* Hide chat icon when drawer is open */
  useEffect(() => {
    const lincChat = document.getElementsByClassName('linc-web-chat')?.[0] as HTMLElement

    if (cartOpen && lincChat) {
      lincChat.style.display = 'none'
    } else if (!cartOpen && lincChat) {
      lincChat.style.display = ''
    }
  })
  useEffect(() => {
    setScrollHeight(
      window?.innerHeight -
        (footerRef?.current?.offsetHeight + drawerHeaderRef?.current?.offsetHeight)
    )
  }, [footerRef.current, drawerHeaderRef.current])

  useEffect(() => {
    const handleResize = () => {
      setScrollHeight(
        window?.innerHeight -
          (footerRef?.current?.offsetHeight + drawerHeaderRef?.current?.offsetHeight)
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleShareCartClick = useCallback(() => {
    shareCart()
  }, [shareCart])

  const cartQuantity = useMemo(
    () => cart?.items?.reduce((prev, product) => prev + product.quantity, 0) || 0,
    [cart?.items]
  )

  const disableRemoveButton = useMemo(() => {
    return isMutatingCart || isSharingCart
  }, [isMutatingCart, isSharingCart])

  const cartItems = useMemo(
    () =>
      cart?.items?.length
        ? cart.items.map(product => (
            <CartItem
              key={product.sku}
              product={product}
              aria-disabled={disableRemoveButton}
              disabled={disableRemoveButton}
            />
          ))
        : undefined,
    [cart, disableRemoveButton]
  )

  const subtotal =
    cart?.items?.reduce((total, item) => {
      const price = item?.onSalePrice
      return price * (item.quantity || 1) + total //item.onSalePrice || item.price
    }, 0) || 0

  const freeShippingSubtotal =
    cart?.items
      .filter(product => !product?.productClassificationIDs?.includes(361))
      .reduce((total, item) => {
        const price = item?.onSalePrice
        return price * (item.quantity || 1) + total //item.onSalePrice || item.price
      }, 0) || 0

  const percentage = Math.round((freeShippingSubtotal / 150) * 100)
  const difference = 150 - freeShippingSubtotal

  const cartHeaderTextTwo =
    freeShippingSubtotal >= 100 && freeShippingSubtotal < 150 ? (
      <>
        <Typography as="h6" className="!font-semibold">
          $10 off shipping UNLOCKED!
        </Typography>
        <Typography as="p" className="!mt-0 pb-4">
          You are just {formatCurrency(difference)} away from FREE SHIPPING!
        </Typography>
      </>
    ) : freeShippingSubtotal >= 150 ? (
      <div className="pb-4">
        <Typography>
          🎉 Cheers! You&apos;ve unlocked{' '}
          <Typography className="font-bold">FREE SHIPPING</Typography>
        </Typography>
      </div>
    ) : (
      <>
        <Typography as="h6" className="!font-semibold">
          UNLOCK your shipping discounts!
        </Typography>
        <Typography as="p" className="!mt-0">
          {formatCurrency(100 - freeShippingSubtotal)} more for $10 off shipping!
        </Typography>
        <Typography as="p" className="!mt-0 pb-4">
          {formatCurrency(difference)} more for FREE SHIPPING!
        </Typography>
      </>
    )

  const isCheckoutButtonDisabled = useMemo(
    () => cartItems === undefined || isMutatingCart || isSharingCart,
    [cartItems, isMutatingCart, isSharingCart]
  )

  const handleCheckoutClick: MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault()
    vaildateCartStock()
  }

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
        <CloseButton
          className="absolute text-secondary-light right-4 top-3 z-10 hover:text-primary"
          size="lg"
          onClick={toggleCartOpen}
        />
        <div
          ref={drawerHeaderRef}
          className={`
            sticky left-0 top-0 flex w-full flex-col border-b border-base-dark bg-base-light
            lg:grid lg:grid-rows-[auto_1fr_auto]
          `}
        >
          <Typography as="h1" className="h4 text-center py-2 bg-primary text-secondary-light">
            Your Cart {cartQuantity === 0 ? undefined : `(${cartQuantity})`}
          </Typography>
          <div
            className={`
              grid w-full items-center`}
          >
            <div className="w-full space-y-1 px-4 text-center pt-4">
              {cartHeaderTextTwo}
              <div className="mb-4 !mt-0 h-5 w-full rounded-full bg-neutral">
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
            <div
              className="overflow-y-scroll"
              style={{
                maxHeight: `${scrollHeight}px`,
              }}
            >
              <div className="divide-y divide-neutral-200 bg-neutral-50 pl-4">{cartItems}</div>
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
