import { ChangeEvent, useCallback, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Select, SelectProps } from '@mantine/core'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { NumberPicker } from '@/core/components/number-picker'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { GtmCustomEvents } from '@/lib/constants/gtm-events'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/cart/update-quantity'
import { SCOUT_CIRCLE_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { CartItem, SubscriptionProduct } from '@/lib/types'
import { getProductButtonText } from '@/lib/utils/button'
import { trackEvent } from '@/lib/utils/gtm-service'
import { trackProductAddToCart, trackSelectedProduct } from '@/lib/utils/gtm-util'

import { BlurImage } from '../blur-image'
import { Price } from '../price'

import { ProductImageLink } from './product-image-link'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

const MIN = 1
const MAX = 24

interface ProductCardProps {
  className?: string
  priority?: boolean
  product: SubscriptionProduct | CartItem
  prismicColor: string
}

const isCartProduct = (product: SubscriptionProduct | CartItem): product is CartItem =>
  'orderLineId' in product && 'orderId' in product && 'quantity' in product

const selectStyles: SelectProps['styles'] = theme => ({
  item: {
    '&[data-hovered]': {},
    '&[data-selected]': {
      '&, &:hover': {
        backgroundColor: theme.colors.gray['9'],
        color: theme.colors.white,
      },
    },
  },
})

export const ProductCard = ({ className, priority = false, product,prismicColor }: ProductCardProps) => {
  const isDesktop = useIsDesktop()
  const [changedVariation, setChangedVariation] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(product)
  const [selectedSku, setSelectedSku] = useState(selectedProduct.sku)
  const [variationType, setVariationType] = useState<string>()
  const { toggleCartOpen } = useProcessStore()

  const { data: session } = useSession()
  const { data: cart } = useCartQuery()
  const { mutate: addToCart, isLoading: isAddingToCart } = useAddToCartMutation()
  const { mutate: updateQuantity, isLoading: isUpdatingQuantity } = useUpdateQuantityMutation()
  const numberPickerDisabled = isAddingToCart || isUpdatingQuantity
  const router = useRouter()

  const lowStock = useMemo(() => product.quantityAvailable <= 30, [product.quantityAvailable])

  const handleQuantityChange = useCallback(
    (item: CartItem, newQuantity?: number) => {
      const quantityToSend = newQuantity || quantity
      if (cart?.items.find(product => product.sku === item.sku) && quantityToSend >= 1) {
        updateQuantity({
          item: product,
          orderId: item.orderId,
          orderLineId: item.orderLineId,
          quantity: quantityToSend,
        })
      } else {
        addToCart({ item, quantity: quantityToSend })
      }

      toggleCartOpen()
    },
    [addToCart, cart?.items, product, quantity, toggleCartOpen, updateQuantity]
  )

  const handleAddToCart = useCallback(() => {
    addToCart({ item: product, quantity })
    // Track Add to cart
    trackProductAddToCart(product, quantity)
    // Track that this Add to cart is coming from the product card
    trackEvent({ event: GtmCustomEvents.PRODUCT_CARD_ADD_TO_CART })
    toggleCartOpen()
  }, [addToCart, product, quantity, toggleCartOpen])

  const badges = useMemo(
    () =>
      selectedProduct.badges !== undefined ? (
        <div className="absolute left-4 top-4 flex flex-col space-y-1 lg:space-y-2">
          {selectedProduct.badges.map(badge => (
            <div key={badge.imageUrl} className="flex items-center gap-1.5">
              <div className="h-6 w-6 lg:h-9 lg:w-9 relative">
                <BlurImage
                  fill
                  alt={badge.name}
                  className="object-contain"
                  sizes="(max-width: 992px) 50vw, (max-width: 1400px) 100vw"
                  src={badge.imageUrl}
                />
              </div>
              <Typography className="text-sm">{badge.name}</Typography>
            </div>
          ))}
        </div>
      ) : undefined,
    [selectedProduct.badges]
  )

  const variationOptions = useMemo(
    () =>
      product.subscriptionProduct?.variations !== undefined
        ? product.subscriptionProduct?.variations
            .filter(variation => variation.active)
            .flatMap(variation =>
              variation.variations?.map(innerVariation => ({
                group: innerVariation.type,
                label: innerVariation.option,
                value: variation.sku,
              }))
            )
            .filter(Boolean)
        : [],
    [product.subscriptionProduct?.variations]
  )

  const handleDropdownChange: SelectProps['onChange'] = useCallback(
    (newValue: string) => {
      setVariationType(newValue)
      if (newValue !== product.sku && product.subscriptionProduct !== undefined) {
        setSelectedProduct(product.subscriptionProduct)
        setChangedVariation(true)
      } else {
        setSelectedProduct(product)
        setChangedVariation(false)
      }
      setSelectedSku(newValue)
      setQuantity(1)
    },
    [product]
  )

  const handleAdd = useCallback(() => setQuantity(prev => prev + 1), [])

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value)
    if (newQuantity >= MIN && newQuantity <= MAX) {
      setQuantity(newQuantity)
    }
  }, [])

  const handleRemove = useCallback(() => setQuantity(prev => (prev === 1 ? 1 : prev - 1)), [])

  const variationOptionsDropwdown = useMemo(
    () => [{ label: 'One-time', value: product.sku }, ...variationOptions],
    [product.sku, variationOptions]
  )

  const dropdownOrNumberPicker = useMemo(
    () =>
      product.subscriptionProduct !== undefined || changedVariation ? (
        <div className="grid">
          <label
            aria-label={variationType}
            className="invisible h-0 w-0 text-sm"
            htmlFor="selected-sku"
          >
            {variationType}
          </label>
          <Select
            className="mr-8"
            data={variationOptionsDropwdown}
            id="selected-sku"
            name="selected-sku"
            size="md"
            styles={selectStyles}
            value={selectedSku}
            onChange={handleDropdownChange}
          />
        </div>
      ) : (
        <NumberPicker
          containerClassName="justify-end"
          disabled={numberPickerDisabled}
          handleAdd={handleAdd}
          handleChange={handleChange}
          handleMinus={handleRemove}
          max={MAX}
          min={MIN}
          size={isDesktop ? 'md' : 'sm'}
          value={quantity}
        />
      ),
    [
      changedVariation,
      handleAdd,
      handleChange,
      handleDropdownChange,
      handleRemove,
      isDesktop,
      numberPickerDisabled,
      product.subscriptionProduct,
      quantity,
      selectedSku,
      variationOptionsDropwdown,
      variationType,
    ]
  )

  const productCardButtonText = useMemo(
    () => getProductButtonText(selectedProduct, session?.user?.isClubMember),
    [selectedProduct, session?.user?.isClubMember]
  )

  const onClick = useCallback(() => {
    if (selectedProduct?.ctaText) {
    router.push(selectedProduct?.ctaLink)
    } 
    else if (productCardButtonText === 'Add to Cart') {
      if (isCartProduct(product)) {
        handleQuantityChange(product, quantity)
      } else {
        handleAddToCart()
      }
    } else if (productCardButtonText === 'Details') {
      router.push(`/product/${product.cartUrl}`)
    } else {
      router.push(SCOUT_CIRCLE_PAGE_PATH)
    }
  }, [handleAddToCart, handleQuantityChange, product, productCardButtonText, quantity, router])

  const onProductClick = useCallback(() => {
    trackSelectedProduct(product)
  }, [product])

  const productImageLink = useMemo(
    () => (
      <ProductImageLink
        key={selectedProduct.sku}
        cartUrl={selectedProduct.cartUrl}
        displayName={selectedProduct.displayName}
        pictureUrl={selectedProduct.pictureUrl}
        priority={priority}
        onProductClick={onProductClick}
        ctaLink={selectedProduct?.ctaLink ?? ''}
      />
    ),
    [priority, selectedProduct, onProductClick]
  )

  return (
    <div
      className={clsx(
        `
        relative grid grid-rows-[auto_auto] rounded border border-solid border-base-dark
        bg-base-light p-6 shadow md:gap-6 w-auto max-h-[35rem]
      `,
        className
      )}
    >
      <div className="flex items-center justify-center justify-self-center">
        {badges}
        {productImageLink}
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <div className="grid grid-rows-1">
            <div>
              <div
                className={`
                  text-sm text-neutral-500
                `}
              >
                <Typography>{selectedProduct.attributes?.Varietal}</Typography>
              </div>
              <Link
                className="card-title text-base font-semibold leading-normal !text-neutral-900"
                href={`/product/${product.cartUrl}`}
                onClick={onProductClick}
              >
                {selectedProduct.displayName}
              </Link>
            </div>
            <div
              className={`
                flex items-center justify-between md:flex-col md:items-start md:gap-2 md:pt-2
              `}
            >
              <Price price={selectedProduct.price} onSalePrice={selectedProduct.onSalePrice} />
            </div>
          </div>
        </div>
        {lowStock ? (
          <Typography className="text-error text-right text-14 pb-2">
            Only {product.quantityAvailable - 20} available!
          </Typography>
        ) : undefined}
        <div
          className={clsx(
            'flex items-center justify-between',
            productCardButtonText !== 'Add to Cart' && '!justify-end'
          )}
        >
          {productCardButtonText !== 'Add to Cart' ? undefined : dropdownOrNumberPicker}
          <Button
            color="secondary"
            disabled={numberPickerDisabled}
            size={isDesktop ? 'md' : 'sm'}
            onClick={onClick}
            style={{ backgroundColor: prismicColor }}
          >
            {selectedProduct?.ctaText ?? productCardButtonText}
          </Button>
        </div>
      </div>
    </div>
  )
}


