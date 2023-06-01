import { ChangeEventHandler, useCallback, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { Button } from '@/core/components/button'
import { NumberPicker } from '@/core/components/number-picker'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/cart/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProductQuery } from '@/lib/queries/products'
import { useProcessStore } from '@/lib/stores/process'
import { CartItem, SubscriptionProduct } from '@/lib/types'

import { usePdpActions, usePdpSelectedOption, usePdpSelectedProduct } from '../../store'
import { Variations } from '../variations'

const Options = dynamic(() => import('../options').then(({ Options }) => Options))

interface CTAProps {
  cartUrl: string
}

const isCartProduct = (product: SubscriptionProduct | CartItem): product is CartItem =>
  'orderLineId' in product && 'orderId' in product && 'quantity' in product

const MIN = 1
const MAX = 24

export const CTA = ({ cartUrl }: CTAProps) => {
  const { data: flightData } = useProductQuery(cartUrl)
  const selectedOption = usePdpSelectedOption()
  const selectedProduct = usePdpSelectedProduct()
  const [quantity, setQuantity] = useState(1)
  const { toggleCartOpen } = useProcessStore()
  const { setSelectedProduct } = usePdpActions()

  const { data: cart } = useCartQuery()
  const { mutate: addToCart, isLoading: isAddingToCart } = useAddToCartMutation()
  const { mutate: updateQuantity, isLoading: isUpdatingQuantity } = useUpdateQuantityMutation()
  const numberPickerDisabled = isAddingToCart || isUpdatingQuantity

  const handleQuantityChange = useCallback(
    (item: CartItem, newQuantity?: number) => {
      const quantityToSend = newQuantity || quantity
      const product = cart?.items.find(product => product.sku === item.sku)
      if (selectedProduct !== undefined && product !== undefined && quantityToSend >= 1) {
        updateQuantity({
          item,
          orderId: item.orderId,
          orderLineId: item.orderLineId,
          quantity: quantityToSend,
        })
      } else {
        addToCart({ item, quantity: quantityToSend })
      }

      toggleCartOpen()
    },
    [addToCart, cart?.items, quantity, selectedProduct, toggleCartOpen, updateQuantity]
  )

  const handleAddToCart = useCallback(() => {
    if (selectedProduct !== undefined) {
      let item = selectedProduct

      if (selectedOption === 'subscription' && selectedProduct.subscriptionProduct) {
        item = selectedProduct.subscriptionProduct
      }
      addToCart({ item, quantity })
      toggleCartOpen()
    }
  }, [addToCart, quantity, selectedOption, selectedProduct, toggleCartOpen])

  const handleAdd = useCallback(() => {
    setQuantity(prev => prev + 1)
  }, [])

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
    const newQuantity = parseInt(event.target.value)
    if (newQuantity >= MIN && newQuantity <= MAX) {
      setQuantity(newQuantity)
    }
  }, [])

  const handleRemove = useCallback(() => {
    setQuantity(prev => (prev === 1 ? 1 : prev - 1))
  }, [])

  const handleAddToCartClick = useCallback(() => {
    if (selectedProduct !== undefined && isCartProduct(selectedProduct)) {
      handleQuantityChange(selectedProduct, quantity)
    } else {
      handleAddToCart()
    }
  }, [selectedProduct, handleAddToCart, handleQuantityChange, quantity])

  useEffect(() => {
    if (selectedProduct === undefined) {
      setSelectedProduct(flightData || undefined)
    }
  }, [flightData, selectedProduct, setSelectedProduct])

  return (
    <div className="my-4 space-y-4 border-y border-neutral-light py-6">
      {flightData?.subscriptionProduct !== undefined ? <Options cartUrl={cartUrl} /> : undefined}
      {flightData?.subscriptionProduct === undefined &&
      flightData?.variations !== undefined &&
      flightData?.variations.length > 0 ? (
        <Variations cartUrl={cartUrl} />
      ) : undefined}
      <div className="grid auto-rows-auto grid-cols-[auto_1fr] gap-4">
        <NumberPicker
          disabled={numberPickerDisabled}
          handleAdd={handleAdd}
          handleChange={handleChange}
          handleMinus={handleRemove}
          max={MAX}
          min={MIN}
          value={quantity}
        />
        <Button dark className="text-lg" onClick={handleAddToCartClick}>
          Add to cart
        </Button>
      </div>
    </div>
  )
}
