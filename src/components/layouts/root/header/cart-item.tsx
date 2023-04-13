import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { BlurImage } from '@/components/blur-image'
import { Price } from '@/components/price'
import { NumberPicker } from '@/core/components/number-picker'
import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { useRemoveFromCartMutation } from '@/lib/mutations/remove-from-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { CartProduct } from '@/lib/types'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

const MIN = 1
const MAX = 24

interface CartItemProps {
  product: CartProduct
}

export const CartItem = ({ product }: CartItemProps) => {
  const { isMutatingCart } = useProcessStore()
  const { mutate: addToCart } = useAddToCartMutation()
  const { mutate: removeFromCart } = useRemoveFromCartMutation()
  const { mutate: updateQuantity } = useUpdateQuantityMutation()
  const { data: cart } = useCartQuery()

  const [quantity, setQuantity] = useState(product.quantity || 1)

  const containerSize = product.attributes?.['Container Size']

  const handleAdd = useCallback(() => {
    setQuantity(prev => {
      if (prev < MAX && prev >= MIN) {
        return prev + 1
      }
      return prev
    })

    if (cart?.items.find(item => product.sku === item.sku)) {
      updateQuantity({
        item: product,
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
          item: product,
          orderId: item.orderId,
          orderLineId: item.orderLineId,
          quantity: newQuantity,
        })
      } else if (newQuantity === 0) {
        removeFromCart({ item, sku: item.sku })
      } else {
        addToCart({ item, quantity: newQuantity })
      }
    },
    [addToCart, product, removeFromCart, updateQuantity]
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (MIN <= 0 || MAX <= 0) {
        return
      }

      const parsedValue = parseInt(event.target.value || '0')
      let newValue = 0
      if (parsedValue >= MIN && parsedValue <= MAX) {
        newValue = parsedValue
      } else if (parsedValue < MIN) {
        newValue = MIN
      } else if (parsedValue > MAX) {
        newValue = MAX
      }

      if (parsedValue > 0) {
        setQuantity(newValue)
        handleQuantityChange(product, parsedValue)
      }
    },
    [handleQuantityChange, product]
  )

  const handleRemove = useCallback(() => {
    removeFromCart({ item: product, sku: product.sku })
  }, [product, removeFromCart])

  const handleMinus = useCallback(() => {
    if (quantity === 1) {
      removeFromCart({ item: product, sku: product.sku })
    } else if (quantity > 1) {
      let newValue: number | undefined

      setQuantity(prev => {
        if (prev > MIN && prev <= MAX) {
          newValue = prev - 1
        } else {
          newValue = prev
        }
        return newValue
      })

      handleQuantityChange(product, quantity > MIN && quantity <= MAX ? quantity - 1 : quantity)
    }
  }, [handleQuantityChange, product, quantity, removeFromCart])

  // * NOTE: There is a bug in Next.js that requires the inline style to remove the console warning.
  const imageDimensions = useMemo(() => ({ height: 128, width: 80 }), [])

  useEffect(() => {
    setQuantity(product.quantity || 1)
  }, [product.quantity])

  return (
    <div className="grid grid-cols-[120px_calc(100%-140px)] gap-3 py-3">
      {product.pictureUrl !== undefined && (
        <Link href={`/product/${product.cartUrl || ''}`}>
          <BlurImage
            alt={product.displayName || 'Product'}
            className="group h-32 w-20 self-center"
            height={128}
            src={product.pictureUrl}
            style={imageDimensions}
            width={80}
          />
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 px-1">
          <div className="flex flex-col">
            <div>
              <Link
                className="font-bold transition-all hover:underline"
                href={`/product/${product.cartUrl || ''}`}
              >
                {product.displayName}
              </Link>
            </div>
            <span className="text-sm">{containerSize}</span>
          </div>
          <Price
            className="text-base !font-semibold"
            price={product.price}
            onSalePrice={
              product.onSalePrice === product.price ? undefined : product.onSalePrice || 0
            }
          />
        </div>
        <div className="ml-auto space-y-2 self-center text-center">
          <NumberPicker
            disabled={isMutatingCart}
            handleAdd={handleAdd}
            handleChange={handleChange}
            handleMinus={handleMinus}
            max={MAX}
            min={MIN}
            value={quantity}
          />
          <button
            className={`
              text-sm text-neutral-400 enabled:hover:text-neutral-500 enabled:hover:underline
              disabled:cursor-not-allowed
            `}
            disabled={isMutatingCart}
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
