import { useMemo } from 'react'

import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useCartQuery } from '@/lib/queries/cart'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'

import { CartProduct } from './cart-product'

export const CartSummary = () => {
  const { data: subtotalInfo } = useGetSubtotalQuery()
  const { data: cart } = useCartQuery()

  const subtotal = subtotalInfo?.subtotal || 0
  const shippingPrice = subtotalInfo?.shipping.price || 0
  const retailDeliveryFee = subtotalInfo?.retailDeliveryFee || 0
  const tax = subtotalInfo?.tax || 0
  const orderTotal = subtotalInfo?.orderTotal || 0

  const cartItems = useMemo(
    () => (
      <div className="my-4 divide-y divide-neutral-light border-y border-y-neutral-light">
        {cart?.items.map(product => (
          <CartProduct key={product.sku} data={product} />
        ))}
      </div>
    ),
    [cart?.items]
  )

  const prices = useMemo(
    () => (
      <div className="grid text-14">
        <div className="grid grid-cols-2 items-center">
          <Typography noSpacing as="p" className="text-neutral-500">
            Subtotal
          </Typography>
          <Typography noSpacing as="p" className="text-right">
            {subtotal ? formatCurrency(subtotal) : '$--.--'}
          </Typography>
        </div>
        <div className="grid grid-cols-2 items-center">
          <Typography noSpacing as="p" className="text-neutral-500">
            Shipping
          </Typography>
          <Typography noSpacing as="p" className="text-right">
            {formatCurrency(shippingPrice)}
          </Typography>
        </div>
        {retailDeliveryFee ? (
          <div className="grid grid-cols-2 items-center">
            <Typography noSpacing as="p" className="text-neutral-500">
              Retail Delivery Fee
            </Typography>
            <Typography noSpacing as="p" className="text-right">
              {formatCurrency(retailDeliveryFee)}
            </Typography>
          </div>
        ) : undefined}
        <div className="grid grid-cols-2 items-center">
          <Typography noSpacing as="p" className="text-neutral-500">
            Tax
          </Typography>
          <Typography noSpacing as="p" className="text-right">
            {tax ? formatCurrency(tax) : '$--.--'}
          </Typography>
        </div>
        <div className="mt-4 grid grid-cols-2 items-center text-base font-bold">
          <Typography noSpacing as="p">
            TOTAL
          </Typography>
          <Typography noSpacing as="p" className="text-right">
            {orderTotal ? formatCurrency(orderTotal) : '$--.--'}
          </Typography>
        </div>
      </div>
    ),
    [orderTotal, retailDeliveryFee, shippingPrice, subtotal, tax]
  )

  return (
    <>
      {cartItems}
      {prices}
    </>
  )
}
