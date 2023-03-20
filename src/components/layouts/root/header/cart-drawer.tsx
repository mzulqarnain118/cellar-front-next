import { useMemo } from 'react'

import Link from 'next/link'

import { Price } from '@/components/price'
import { formatCurrency } from '@/core/utils'
import { useCartQuery } from '@/lib/queries/cart'

import { CartItem } from './cart-item'

export const CartDrawer = () => {
  const { data: cart } = useCartQuery()

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
      return price * item.quantity + total
    }, 0) || 0
  const percentage = Math.round((subtotal / 150) * 100)
  const difference = 150 - subtotal

  return (
    <div className="mt-2 grid h-full w-[40vw] grid-rows-[auto_1fr_auto]">
      {cartItems !== undefined && (
        <div
          className={`
            flex w-full items-center justify-between border-b-2 border-neutral-100 pb-4
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
                🎉 Cheers! You&apos;ve unlocked <span className="font-bold">FREE SHIPPING</span>!
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
      )}
      {cartItems !== undefined ? (
        <div className="divide-y-2 divide-neutral-100 px-4">{cartItems}</div>
      ) : (
        <div className="grid items-center justify-items-center px-4">Your cart is empty.</div>
      )}
      <div
        className={`
          flex h-max w-full items-center justify-between gap-10 self-end border-t-2
          border-neutral-100 p-4
        `}
      >
        <div className="flex flex-col">
          <span>Subtotal</span>
          <Price price={subtotal || 0} />
        </div>
        <Link
          className="w-full rounded bg-brand px-4 py-2 text-center transition-colors"
          href="/checkout"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
