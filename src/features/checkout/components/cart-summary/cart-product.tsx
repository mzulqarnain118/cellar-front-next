import { ChangeEvent, useCallback, useState } from 'react'

import Image from 'next/image'

import { CloseButton } from '@mantine/core'

import { Price } from '@/components/price'
import { NumberPicker } from '@/core/components/number-picker'
import { Typography } from '@/core/components/typogrpahy'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { useRemoveFromCartMutation } from '@/lib/mutations/cart/remove-from-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/cart/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { CartItem } from '@/lib/types'

const MIN = 1
const MAX = 24

interface CartProductProps {
  data: CartItem
}

export const CartProduct = ({ data }: CartProductProps) => {
  const [quantity, setQuantity] = useState(data.quantity)
  const { mutate: addToCart } = useAddToCartMutation()
  const { mutate: removeFromCart } = useRemoveFromCartMutation()
  const { mutate: updateQuantity } = useUpdateQuantityMutation()
  const { data: cart } = useCartQuery()
  const { isMutatingCart } = useProcessStore()

  const handleAdd = useCallback(() => {
    setQuantity(prev => {
      if (prev < MAX && prev >= MIN) {
        return prev + 1
      }
      return prev
    })

    if (cart?.items?.find(item => data.sku === item.sku)) {
      updateQuantity({
        fetchSubtotal: true,
        item: data,
        orderId: data.orderId,
        orderLineId: data.orderLineId,
        quantity: data.quantity + 1,
      })
    } else {
      addToCart({ fetchSubtotal: true, item: data, quantity: data.quantity + 1 })
    }
  }, [addToCart, cart?.items, data, updateQuantity])

  const handleQuantityChange = useCallback(
    (item: CartItem, newQuantity: number) => {
      if (newQuantity >= 1) {
        updateQuantity({
          fetchSubtotal: true,
          item: data,
          orderId: item.orderId,
          orderLineId: item.orderLineId,
          quantity: newQuantity,
        })
      } else if (newQuantity === 0) {
        removeFromCart({ fetchSubtotal: true, item, sku: item.sku })
      } else {
        addToCart({ fetchSubtotal: true, item, quantity: newQuantity })
      }
    },
    [addToCart, data, removeFromCart, updateQuantity]
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
        handleQuantityChange(data, parsedValue)
      }
    },
    [handleQuantityChange, data]
  )

  const handleRemove = useCallback(() => {
    removeFromCart({ fetchSubtotal: true, item: data, sku: data.sku })
  }, [data, removeFromCart])

  const handleMinus = useCallback(() => {
    if (quantity === 1) {
      removeFromCart({ fetchSubtotal: true, item: data, sku: data.sku })
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

      handleQuantityChange(data, quantity > MIN && quantity <= MAX ? quantity - 1 : quantity)
    }
  }, [handleQuantityChange, data, quantity, removeFromCart])

  return (
    <div className="grid grid-cols-[auto_1fr] px-2 py-4">
      {data.pictureUrl ? (
        <div className="relative h-16 w-20">
          <Image fill alt={data.displayName} className="object-contain" src={data.pictureUrl} />
        </div>
      ) : undefined}
      <div className="grid items-center">
        <div className="flex items-center justify-between">
          <Typography className="font-bold">{data.displayName}</Typography>
          <CloseButton
            className="hover:text-error"
            disabled={isMutatingCart}
            onClick={handleRemove}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography>QTY</Typography>
            <NumberPicker
              disabled={isMutatingCart}
              handleAdd={handleAdd}
              handleChange={handleChange}
              handleMinus={handleMinus}
              max={MAX}
              min={MIN}
              size="sm"
              value={quantity}
            />
          </div>
          <Price className="!text-14" price={data.price} onSalePrice={data.onSalePrice} />
        </div>
      </div>
    </div>
  )
}
