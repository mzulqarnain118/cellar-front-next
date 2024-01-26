import { useMemo } from 'react'

import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { SUMMER_PACKAGING } from '@/lib/constants/shipping-method'
import { useCartQuery } from '@/lib/queries/cart'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useCheckoutAppliedSkyWallet } from '@/lib/stores/checkout'

import { CartProduct } from './cart-product'

export const CartSummary = () => {
  const { data: subtotalInfo } = useGetSubtotalQuery()
  const { data: cart } = useCartQuery()
  const appliedSkyWallet = useCheckoutAppliedSkyWallet()

  const subtotal = useMemo(() => subtotalInfo?.subtotal || 0, [subtotalInfo?.subtotal])
  const shippingPrice = useMemo(
    () => subtotalInfo?.shipping.price || 0,
    [subtotalInfo?.shipping.price]
  )
  const retailDeliveryFee = useMemo(
    () => subtotalInfo?.retailDeliveryFee || 0,
    [subtotalInfo?.retailDeliveryFee]
  )
  const tax = useMemo(() => subtotalInfo?.tax || 0, [subtotalInfo?.tax])
  const orderTotal = useMemo(() => {
    const total = (subtotalInfo?.orderTotal || 0) - appliedSkyWallet

    if (total <= 0) {
      return 0
    }

    return total
  }, [appliedSkyWallet, subtotalInfo?.orderTotal])
  const shippingMethodId = subtotalInfo?.shipping.methodId

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
            {tax || tax === 0 ? formatCurrency(tax) : '$--.--'}
          </Typography>
        </div>
        {appliedSkyWallet ? (
          <div className="grid grid-cols-2 items-center">
            <Typography noSpacing as="p" className="text-neutral-500">
              Sky Wallet
            </Typography>
            <Typography noSpacing as="p" className="text-success text-right">
              -{formatCurrency(appliedSkyWallet)}
            </Typography>
          </div>
        ) : undefined}
        <div className="mt-4 grid grid-cols-2 items-center text-base font-bold">
          <Typography noSpacing as="p">
            TOTAL
          </Typography>
          <Typography noSpacing as="p" className="text-right">
            {subtotalInfo !== undefined || orderTotal ? formatCurrency(orderTotal) : '$--.--'}
          </Typography>
        </div>
        {shippingMethodId !== undefined &&
          (SUMMER_PACKAGING.includes(shippingMethodId) || shippingMethodId > 39) ? (
          <Typography as="em" className="block py-1 text-sm">
            * Orders with wine include a $5 shipping surcharge for EcoCoolPaks to protect your wine
            from summer heat.
          </Typography>
        ) : undefined}
      </div>
    ),
    [
      appliedSkyWallet,
      orderTotal,
      retailDeliveryFee,
      shippingMethodId,
      shippingPrice,
      subtotal,
      subtotalInfo,
      tax,
    ]
  )

  return (
    <>
      {cartItems}
      {prices}
    </>
  )
}
