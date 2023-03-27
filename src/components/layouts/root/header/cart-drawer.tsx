import { MouseEventHandler, useCallback, useMemo } from 'react'

import dynamic from 'next/dynamic'

import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import { Price } from '@/components/price'
import { formatCurrency } from '@/core/utils'
import { WINE_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

import { CartItem } from './cart-item'

export const CartDrawer = () => {
  const { data: cart } = useCartQuery()
  const { isMutatingCart, toggleCartOpen } = useProcessStore()

  const cartItems = useMemo(
    () =>
      cart?.items.length
        ? cart.items.map(product => <CartItem key={product.sku} product={product} />)
        : undefined,
    [cart?.items]
  )

  const subtotal =
    cart?.items.reduce((total, item) => {
      const price = item.onSalePrice || item.price
      return price * (item.quantity || 1) + total
    }, 0) || 0
  const percentage = Math.round((subtotal / 150) * 100)
  const difference = 150 - subtotal

  const isCheckoutButtonDisabled = useMemo(
    () => cartItems === undefined || isMutatingCart,
    [cartItems, isMutatingCart]
  )

  const handleCheckoutClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    event => {
      if (isCheckoutButtonDisabled) {
        event.preventDefault()
      }
    },
    [isCheckoutButtonDisabled]
  )

  const handleGoShoppingClick = useCallback(() => {
    toggleCartOpen()
  }, [toggleCartOpen])

  return (
    <div className="relative flex h-full w-screen flex-col lg:w-[40vw]">
      <button
        className="btn-error btn-square btn-sm btn absolute top-3 right-3"
        onClick={toggleCartOpen}
      >
        <XMarkIcon className="h-6 w-6 stroke-2 text-neutral-50" />
        <span className="sr-only">Close button</span>
      </button>
      <h1 className="h3 m-0 py-4 text-center">Your Cart</h1>
      <div className="flex-1">
        {cartItems !== undefined ? (
          <div className="divide-y">
            <div
              className={`
              flex w-full items-center justify-between pb-4
            `}
            >
              <div className="w-full space-y-1 px-4 text-center">
                {difference > 0 ? (
                  <span>
                    You are {formatCurrency(difference)} away from{' '}
                    <span className="font-bold">FREE SHIPPING</span>
                  </span>
                ) : (
                  <span>
                    🎉 Cheers! You&apos;ve unlocked <span className="font-bold">FREE SHIPPING</span>
                    !
                  </span>
                )}

                <div className="mb-4 h-5 w-full rounded-full bg-neutral-200">
                  <div
                    className="h-5 rounded-full bg-brand"
                    style={{ maxWidth: '100%', width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-neutral-200 overflow-y-auto px-4">{cartItems}</div>
          </div>
        ) : (
          <div className="grid h-full grid-cols-1 grid-rows-1 items-center justify-items-center px-4">
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="pb-2 text-lg">Your cart is empty!</span>
              <Link
                className={`
                btn-outline btn-secondary btn-sm btn inline-flex items-center justify-center gap-1
              `}
                href={WINE_PAGE_PATH}
                onClick={handleGoShoppingClick}
              >
                Go shopping
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
      <div
        className={`
          flex w-full items-center justify-between gap-10 border-t-2 border-neutral-100 p-4
        `}
      >
        <div className="flex flex-col">
          <span>Subtotal</span>
          <Price price={subtotal || 0} subtext={false} />
        </div>
        <Link
          aria-disabled={isCheckoutButtonDisabled}
          className={clsx('btn-primary btn flex-1', isCheckoutButtonDisabled && 'btn-disabled')}
          href="/checkout"
          onClick={handleCheckoutClick}
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
