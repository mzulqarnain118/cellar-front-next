import { useCallback } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Price } from '@/components/price'
import { NumberPicker } from '@/core/components/number-picker'
import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { useRemoveFromCartMutation } from '@/lib/mutations/remove-from-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { CartProduct } from '@/lib/types'

interface CartItemProps {
  product: CartProduct
}

export const CartItem = ({ product }: CartItemProps) => {
  const { mutate: addToCart } = useAddToCartMutation()
  const { mutate: removeFromCart } = useRemoveFromCartMutation()
  const { mutate: updateQuantity } = useUpdateQuantityMutation()
  const { data: cart } = useCartQuery()

  const containerSize = product.attributes?.['Container Size']

  const handleAdd = useCallback(() => {
    if (cart?.items.find(item => product.sku === item.sku)) {
      updateQuantity({
        orderId: product.orderId,
        orderLineId: product.orderLineId,
        quantity: product.quantity + 1,
      })
    } else {
      addToCart({ item: product, quantity: product.quantity + 1 })
    }
  }, [addToCart, cart?.items, product, updateQuantity])

  const handleQuantityChange = useCallback(
    (item: CartProduct, newQuantity: number) => {
      if (newQuantity >= 1) {
        updateQuantity({
          orderId: item.orderId,
          orderLineId: item.orderLineId,
          quantity: newQuantity,
        })
      } else if (newQuantity === 0) {
        removeFromCart({ sku: item.sku })
      } else {
        addToCart({ item, quantity: newQuantity })
      }
    },
    [addToCart, removeFromCart, updateQuantity]
  )

  const handleChange = useCallback(
    (newQuantity: number) => handleQuantityChange(product, newQuantity),
    [handleQuantityChange, product]
  )

  const handleRemove = useCallback(
    () => removeFromCart({ sku: product.sku }),
    [product.sku, removeFromCart]
  )

  return (
    <div className="grid grid-cols-[120px_calc(100%-140px)] gap-3 py-3">
      {product.pictureUrl !== undefined && (
        <Link href={product.cartUrl || ''}>
          <Image
            alt={product.displayName || 'Product'}
            className="group h-auto w-20 self-center"
            height={0}
            sizes="100vw"
            src={product.pictureUrl}
            width={0}
          />
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <div>
              <Link
                className="font-bold transition-all hover:underline"
                href={product.cartUrl || ''}
              >
                {product.displayName}
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
            handleAdd={handleAdd}
            handleChange={handleChange}
            handleRemove={handleRemove}
            initialValue={product.quantity}
          />
          <button
            className="text-sm text-neutral-400 hover:text-neutral-500 hover:underline"
            type="button"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
