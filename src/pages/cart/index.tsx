import { useCallback, useMemo } from 'react'

import { NextPage } from 'next'

import { useRouter } from 'next/router'

import { Button, Drawer, LoadingOverlay, TextInput } from '@mantine/core'
import { useDisclosure, useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

import { CartItem } from '@/components/layouts/root/header/cart-item'
import { delay } from '@/core/utils/time'
import { CheckoutDrawer } from '@/features/cart/checkout-drawer'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'

const closeButtonProps = {
  'aria-label': 'Close modal',
}

const promoCodeClassNames = {
  input: `
    h-10 w-full rounded-lg border border-neutral-300 bg-neutral-100 px-3 outline-brand-300
    transition-all duration-500 placeholder:text-neutral-700 focus:!outline focus:outline-1
    focus:outline-offset-0 focus:outline-brand-300 tracking-widest rounded-r-none
  `,
}

const CartPage: NextPage = () => {
  const reduceMotion = useReducedMotion()
  const router = useRouter()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const [signInChecked, { close: unsetSignInChecked, toggle: toggleSignInChecked }] =
    useDisclosure(false)
  const disclosureOptions = useMemo(
    () => ({
      onClose: async () => {
        // * NOTE: Wait 500ms to prevent the UI from visibly flashing.
        await delay(500)
        unsetSignInChecked()
      },
    }),
    [unsetSignInChecked]
  )
  const [opened, { close, open }] = useDisclosure(false, disclosureOptions)

  const cartItems = useMemo(
    () =>
      cart?.items.length
        ? cart.items.map(product => <CartItem key={product.sku} product={product} />)
        : undefined,
    [cart?.items]
  )

  const handleCheckoutClick = useCallback(() => {
    if (session?.user) {
      router.push(CHECKOUT_PAGE_PATH)
      return
    } else {
      open()
    }
  }, [open, router, session?.user])

  const drawerClassNames = useMemo(
    () => ({
      content: reduceMotion
        ? ''
        : clsx('!min-h-[30.75rem] h-auto transition-all', signInChecked && '!h-80'),
    }),
    [reduceMotion, signInChecked]
  )

  const [overlayVisible, { close: hideOverlay, open: showOverlay }] = useDisclosure(false)

  return (
    <>
      <Drawer
        classNames={drawerClassNames}
        closeButtonProps={closeButtonProps}
        opened={opened}
        position="bottom"
        onClose={close}
      >
        <LoadingOverlay visible={overlayVisible} />
        <CheckoutDrawer
          hideOverlay={hideOverlay}
          showOverlay={showOverlay}
          signInChecked={signInChecked}
          toggleSignInChecked={toggleSignInChecked}
        />
      </Drawer>
      <div className="container mx-auto py-4">
        <div className="space-y-2">
          <h1 className="h4">Your Cart</h1>
          {cartItems}
          <div className="grid grid-cols-2 items-end py-4">
            <TextInput
              classNames={promoCodeClassNames}
              label="Promo Code"
              placeholder="XXXXX-XXXXX-XXXXX"
            />
            <Button className="h-10 rounded-l-none" color="brand">
              Apply
            </Button>
          </div>
          <div className="rounded bg-accent-50 p-4">
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
          <Button fullWidth color="dark" size="md" onClick={handleCheckoutClick}>
            Checkout
          </Button>
        </div>
      </div>
    </>
  )
}

export default CartPage
