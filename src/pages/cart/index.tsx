import { useMemo } from 'react'

import { NextPage } from 'next'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button, TextInput } from '@mantine/core'

import { CartItem } from '@/components/layouts/root/header/cart-item'
import { Link } from '@/components/link'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

const CartPage: NextPage = () => {
  const { data: cart } = useCartQuery()
  const href = useMemo(() => ({ pathname: SIGN_IN_PAGE_PATH }), [])

  const cartItems = useMemo(
    () =>
      cart?.items.length
        ? cart.items.map(product => <CartItem key={product.sku} product={product} />)
        : undefined,
    [cart?.items]
  )

  const classNames = useMemo(
    () => ({
      input: `
        h-10 w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 outline-brand-300
        transition-all duration-500 placeholder:text-neutral-700 focus:!outline focus:outline-1
        focus:outline-offset-0 focus:outline-brand-300 tracking-widest rounded-r-none
      `,
    }),
    []
  )

  return (
    <div className="container mx-auto py-4">
      <div className="space-y-2">
        <Button
          className={`
            flex items-center gap-2 rounded transition-all
            enabled:hover:gap-4
          `}
          component={Link}
          href={href}
          variant=""
        >
          Sign in for a better and faster checkout experience
          <ChevronRightIcon className="h-6 w-6" />
        </Button>
        <h1 className="h4">Your Cart</h1>
        {cartItems}
        <div className="grid grid-cols-2 items-end py-4">
          <TextInput classNames={classNames} label="Promo Code" placeholder="XXXXX-XXXXX-XXXXX" />
          <Button className="h-10 rounded-l-none" color="brand">
            Apply
          </Button>
        </div>
        <div className="rounded bg-neutral-50 p-4">
          <h2 className="h5 mb-3 !mt-0 !font-semibold !tracking-wider">Order Summary</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between tracking-wider text-neutral-600">
              <span>Subtotal</span>
              <span className="tracking-widest">$190.00</span>
            </div>
            <div className="flex items-center justify-between tracking-wider text-neutral-600">
              <span>Sales Tax</span>
              <span className="tracking-widest">$--.--</span>
            </div>
            <div className="flex items-center justify-between tracking-wider text-neutral-600">
              <span>Shipping</span>
              <span className="tracking-widest">$--.--</span>
            </div>
            <div
              className={`
                !mt-3 flex items-center justify-between border-y border-neutral-300 py-3 font-bold
                tracking-wider text-neutral-900
              `}
            >
              <span>Total</span>
              <span className="tracking-widest">$190.00</span>
            </div>
          </div>
        </div>
        <Button fullWidth color="dark" size="md">
          Checkout
        </Button>
      </div>
    </div>
  )
}

export default CartPage
