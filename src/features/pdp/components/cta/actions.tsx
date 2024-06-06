import { ChangeEventHandler, useCallback, useState } from 'react'

import { useRouter } from 'next/router'

import { useWindowScroll } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { NumberPicker } from '@/core/components/number-picker'
import { Typography } from '@/core/components/typogrpahy'
import { GtmCustomEvents } from '@/lib/constants/gtm-events'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/cart/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProductQuery } from '@/lib/queries/products'
import { useProcessStore } from '@/lib/stores/process'
import { CartItem, SubscriptionProduct } from '@/lib/types'
import { trackEvent } from '@/lib/utils/gtm-service'
import { trackProductAddToCart } from '@/lib/utils/gtm-util'

import { useSession } from 'next-auth/react'
import { usePdpSelectedOption, usePdpSelectedProduct } from '../../store'

const isCartProduct = (product: SubscriptionProduct | CartItem): product is CartItem =>
  'orderLineId' in product && 'orderId' in product && 'quantity' in product

const MIN = 1
const MAX = 24

interface CtaActionsProps {
  className?: string
}

export const CtaActions = ({ className }: CtaActionsProps) => {
  const router = useRouter()
  const { cartUrl } = router.query
  const { data: product } = useProductQuery(cartUrl?.toString() || '')
  const [quantity, setQuantity] = useState(1)
  const { data: session } = useSession()

  const selectedProduct = usePdpSelectedProduct()
  const selectedOption = usePdpSelectedOption()
  const { toggleCartOpen } = useProcessStore()

  const { data: cart } = useCartQuery()
  const { mutate: addToCart, isLoading: isAddingToCart } = useAddToCartMutation()
  const { mutate: updateQuantity, isLoading: isUpdatingQuantity } = useUpdateQuantityMutation()
  const numberPickerDisabled = isAddingToCart || isUpdatingQuantity

  const [_, scrollTo] = useWindowScroll()

  const handleQuantityChange = useCallback(
    (item: CartItem, newQuantity?: number) => {
      const quantityToSend = newQuantity || quantity
      const product = cart?.items.find(product => {
        return product.sku === item.sku
      })
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
      selectedProduct !== undefined ? trackProductAddToCart(selectedProduct, quantity) : {}
      //Track the custom event that this add to cart is coming from the Product Display Page
      trackEvent({ event: GtmCustomEvents.PDP_ADD_TO_CART })
    }
  }, [selectedProduct, handleAddToCart, handleQuantityChange, quantity])

  const handleOptionChange = useCallback(() => {
    const element = document.querySelector('#add-to-cart-section')

    if (element) {
      scrollTo({ y: element.scrollHeight + 200 })
    }
  }, [scrollTo])

  return (
    <div className={className}>
      {className !== undefined ? (
        <div className="flex items-center gap-1">
          <Typography className="text-14">
            {selectedOption === 'subscription'
              ? 'This purchase is a subscription. '
              : 'This purchase is one-time only '}
          </Typography>
          <Button link onClick={handleOptionChange}>
            tap here to change
          </Button>
        </div>
      ) : undefined}
      <div className="grid auto-rows-auto grid-cols-[auto_1fr] gap-4">
        <NumberPicker
          disabled={product && product?.quantityAvailable <= 0 ? true : numberPickerDisabled}
          handleAdd={handleAdd}
          handleChange={handleChange}
          handleMinus={handleRemove}
          max={MAX}
          min={MIN}
          value={quantity}
        />
        {product && product?.quantityAvailable <= 0 ? (
          <Button className="text-lg" disabled={true}>
            Sold Out
          </Button>
        ) : (
          <Button dark className="text-lg" onClick={handleAddToCartClick}>
            {!product?.isClubOnly || session?.user?.isClubMember
              ? 'Add to cart'
              : 'Join the Circle'}
          </Button>
        )}
      </div>
    </div>
  )
}
