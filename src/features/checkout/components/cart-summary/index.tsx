import { useMemo } from 'react'

import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutAppliedSkyWallet } from '@/lib/stores/checkout'

import { CartProduct } from './cart-product'
interface CartSummaryProps {
  cartTotalData: any
}
export const CartSummary = ({ cartTotalData }: CartSummaryProps) => {
  const { data: cart } = useCartQuery()
  const [cartStorage, setCartStorage] = useCartStorage()
  const appliedSkyWallet = useCheckoutAppliedSkyWallet()

  const discountTotal = cartTotalData?.discountTotals.reduce(
    (accumulator: number, currentValue: { amount: number; description: string }) =>
      accumulator + currentValue?.amount,
    0
  )

  const subtotal = useMemo(() => cartTotalData?.subtotal || 0, [cartTotalData?.subtotal])
  const shippingPrice = useMemo(
    () => cartTotalData?.shipping.price || 0,
    [cartTotalData?.shipping.price]
  )
  const retailDeliveryFee = useMemo(
    () => cartTotalData?.retailDeliveryFee || 0,
    [cartTotalData?.retailDeliveryFee]
  )
  const tax = useMemo(() => cartTotalData?.tax || 0, [cartTotalData?.tax])
  const orderTotal = useMemo(() => {
    const total = (cartTotalData?.orderTotal || 0) - appliedSkyWallet

    if (total <= 0) {
      return 0
    }

    return total
  }, [appliedSkyWallet, cartTotalData?.orderTotal])
  const shippingMethodId = cartTotalData?.shipping.methodId

  const cartItems = useMemo(
    () => (
      <div className="my-4 divide-y divide-neutral-light border-y border-y-neutral-light !max-h-[345px] overflow-y-auto">
        {cartStorage?.items.map(product => (
          <CartProduct key={product.sku} data={product} />
        ))}
      </div>
    ),
    [cartStorage]
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
        {discountTotal > 0 ? (
          <div className="grid grid-cols-2 items-center">
            <Typography noSpacing as="p" className="text-neutral-500">
              Discount
            </Typography>
            <Typography noSpacing as="p" className="text-success text-right">
              -{formatCurrency(discountTotal)}
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
            {cartTotalData !== undefined || orderTotal ? formatCurrency(orderTotal) : '$--.--'}
          </Typography>
        </div>
        {/* {shippingMethodId !== undefined &&
          (SUMMER_PACKAGING.includes(shippingMethodId) || shippingMethodId > 39) ? (
          <Typography as="em" className="block py-1 text-sm">
            * Orders with wine include a $5 shipping surcharge for EcoCoolPaks to protect your wine
            from summer heat.
          </Typography>
        ) : undefined} */}
      </div>
    ),
    [
      appliedSkyWallet,
      orderTotal,
      retailDeliveryFee,
      shippingMethodId,
      shippingPrice,
      subtotal,
      cartTotalData,
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
