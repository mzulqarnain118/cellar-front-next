import { useEffect, useId, useRef } from 'react'

import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

import { Price } from '@/components/price'
import { formatCurrency } from '@/core/utils'
import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { useRemoveFromCartMutation } from '@/lib/mutations/remove-from-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { CartItem } from '@/lib/types'
import { Drawer } from '@/ui/drawer'
import { NumberPicker } from '@/ui/number-picker'

export const CartDrawer = () => {
  const { setCartOpen } = useProcessStore()
  const { data: cart } = useCartQuery()
  const cartOpenRef = useRef(useProcessStore.getState().cartOpen)
  const cartItemElementId = useId()
  const { mutate: addToCart } = useAddToCartMutation()
  const { mutate: removeFromCart } = useRemoveFromCartMutation()
  const { mutate: updateQuantity } = useUpdateQuantityMutation()

  useEffect(
    () =>
      useProcessStore.subscribe(({ cartOpen }) => {
        cartOpenRef.current = cartOpen
      }),
    []
  )

  const handleAdd = (item: CartItem) => {
    if (cart?.items.find(product => product.sku === item.sku)) {
      updateQuantity({
        orderId: item.orderId,
        orderLineId: item.orderLineId,
        quantity: item.quantity + 1,
      })
    } else {
      addToCart({ item })
    }
  }

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity({
        orderId: item.orderId,
        orderLineId: item.orderLineId,
        quantity: newQuantity,
      })
    } else if (newQuantity === 0) {
      removeFromCart({ sku: item.sku })
    } else {
      addToCart({ item })
    }
  }

  const cartItems = cart?.items.length
    ? cart.items.map((product, index) => {
        const containerSize = product.attributes.find(att => att.name === 'Container Size')?.value

        return (
          <div
            // ! TODO: Find a fix for this as nothing is more unique than the index.
            // eslint-disable-next-line react/no-array-index-key
            key={`${cartItemElementId}-${product.sku}-${product.quantity}-${index}`}
            className="grid grid-cols-[120px_calc(100%-140px)] gap-3 py-3"
          >
            <Link href={product.cartUrl || ''}>
              <Image
                alt={product.name || 'Product'}
                className="group h-auto w-[80px] self-center"
                height={0}
                sizes="100vw"
                src={product.imageUrl}
                width={0}
              />
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <div>
                    <Link
                      className="font-bold transition-all hover:underline"
                      href={product.cartUrl || ''}
                    >
                      {product.name}
                    </Link>
                  </div>
                  <span className="text-sm">{containerSize}</span>
                </div>
                <Price
                  className="text-base !font-semibold"
                  price={product.price * product.quantity}
                  onSalePrice={product.onSalePrice || 0 * product.quantity}
                />
              </div>
              <div className="ml-auto space-y-2 self-center text-center">
                <NumberPicker
                  handleAdd={() => handleAdd(product)}
                  handleChange={(newQuantity: number) => handleQuantityChange(product, newQuantity)}
                  handleRemove={() => removeFromCart({ sku: product.sku })}
                  initialValue={product.quantity}
                />
                <button
                  className="text-sm text-neutral-400 hover:text-neutral-500 hover:underline"
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      })
    : undefined

  const subtotal =
    cart?.items.reduce((total, item) => {
      const price = item.onSalePrice || item.price
      return price * item.quantity + total
    }, 0) || 0
  const percentage = Math.round((subtotal / 150) * 100)
  const difference = 150 - subtotal

  return (
    <Drawer
      direction="right"
      id="cart-drawer-2"
      open={cartOpenRef.current}
      setOpen={setCartOpen}
      title="Your Cart"
      trigger={
        <button
          aria-label="View shopping cart"
          className={`
            relative flex h-11 w-11 items-center justify-center rounded-lg hover:bg-neutral-100
          `}
          type="button"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCartIcon className="h-6 w-6" />
          <span className="sr-only">Notifications</span>
          <div
            className={`
            absolute top-0 right-0.5 h-4 min-w-[1rem] max-w-[2rem] rounded-full bg-primary-500
            px-1 text-center text-xs font-bold leading-4 text-neutral-100
          `}
          >
            1
          </div>
        </button>
      }
    >
      <div className="mt-2 grid h-full w-[40vw]">
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
                  className="h-5 rounded-full bg-primary-500"
                  style={{ maxWidth: '100%', width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        {cartItems !== undefined ? (
          <div
            className={`
              h-[calc(100vh-228px)] divide-y-2 divide-neutral-100 overflow-y-scroll px-4
            `}
          >
            {cartItems}
          </div>
        ) : (
          <div className={`grid h-[calc(100vh-228px)] items-center justify-items-center px-4`}>
            Your cart is empty.
          </div>
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
            className={`
              w-full rounded bg-primary-500 px-4 py-2 text-center text-neutral-50
              transition-colors hover:bg-primary-400
            `}
            href="/checkout"
          >
            Checkout
          </Link>
        </div>
      </div>
    </Drawer>
  )
}
