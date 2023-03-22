import { ChangeEvent, Fragment, useCallback, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { NumberPicker } from '@/core/components/number-picker'
import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { useUpdateQuantityMutation } from '@/lib/mutations/update-quantity'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'
import { AutoSipProduct, CartProduct } from '@/lib/types'

import { Price } from '../price'
import { Rating } from '../rating'

const MIN = 1
const MAX = 24

interface ProductCardProps {
  priority?: boolean
  product: AutoSipProduct | CartProduct
}

const isCartProduct = (product: AutoSipProduct | CartProduct): product is CartProduct =>
  'orderLineId' in product && 'orderId' in product && 'quantity' in product

export const ProductCard = ({ priority = false, product }: ProductCardProps) => {
  const [selectedProduct, setSelectedProduct] = useState(product)
  const [selectedSku, setSelectedSku] = useState(selectedProduct.sku)
  const [changedVariation, setChangedVariation] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [variationType, setVariationType] = useState<string>()
  const { toggleCartOpen } = useProcessStore()

  const { data: cart } = useCartQuery()
  const { mutate: addToCart } = useAddToCartMutation()
  const { mutate: updateQuantity } = useUpdateQuantityMutation()

  const handleQuantityChange = useCallback(
    (item: CartProduct, newQuantity?: number) => {
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
    toggleCartOpen()
  }, [addToCart, product, quantity, toggleCartOpen])

  const badges = useMemo(
    () =>
      selectedProduct.badges !== undefined && (
        <div className="absolute top-4 left-4 flex flex-col space-y-1 lg:space-y-2">
          {selectedProduct.badges.map(badge => (
            <div
              key={badge.name}
              className="tooltip tooltip-right tooltip-secondary cursor-pointer capitalize"
              data-tip={badge.name}
            >
              <Image
                alt={badge.name}
                className="h-6 w-6 lg:h-8 lg:w-8"
                height={36}
                src={badge.imageUrl}
                width={36}
              />
            </div>
          ))}
        </div>
      ),
    [selectedProduct.badges]
  )

  const variationOptions = useMemo(
    () =>
      product.autoSipProduct?.variations !== undefined
        ? product.autoSipProduct.variations
            .map(variation =>
              variation.active ? (
                variation.variations
                  ?.map(innerVariation => {
                    setVariationType(innerVariation.type)

                    return (
                      <option key={innerVariation.option} value={variation.sku}>
                        {innerVariation.option}
                      </option>
                    )
                  })
                  .filter((element): element is JSX.Element => !!element)
              ) : (
                <Fragment key={variation.sku}></Fragment>
              )
            )
            .filter((element): element is JSX.Element => !!element)
        : undefined,
    [product?.autoSipProduct?.variations]
  )

  const handleDropdownChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value
      if (newValue !== product.sku && product.autoSipProduct !== undefined) {
        setSelectedProduct(product.autoSipProduct)
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

  const dropdownOrNumberPicker = useMemo(
    () =>
      product.autoSipProduct !== undefined || changedVariation ? (
        <div className="grid gap-1">
          <label
            aria-label={variationType}
            className="invisible h-0 w-0 text-sm"
            htmlFor="selected-sku"
          >
            {variationType}
          </label>
          <select
            className="select-bordered select select-sm h-12"
            id="selected-sku"
            name="selected-sku"
            value={selectedSku}
            onChange={handleDropdownChange}
          >
            <option value={product.sku}>One-time</option>
            <optgroup label={variationType}>{variationOptions}</optgroup>
          </select>
        </div>
      ) : (
        <NumberPicker
          handleAdd={handleAdd}
          handleChange={handleChange}
          handleMinus={handleRemove}
          max={MAX}
          min={MIN}
          value={quantity}
        />
      ),
    [
      changedVariation,
      handleAdd,
      handleChange,
      handleDropdownChange,
      handleRemove,
      product,
      quantity,
      selectedSku,
      variationOptions,
      variationType,
    ]
  )

  const onClick = useCallback(() => {
    if (isCartProduct(product)) {
      handleQuantityChange(product, quantity)
    } else {
      handleAddToCart()
    }
  }, [handleAddToCart, handleQuantityChange, product, quantity])

  const productImageDimensions = useMemo(() => ({ height: 304, width: 192 }), [])

  const productImageLink = useMemo(
    () => (
      <figure
        className={`
          relative flex h-full w-[10rem] items-center self-center justify-self-center lg:w-[12rem]
        `}
      >
        {selectedProduct.pictureUrl !== undefined ? (
          <Link href={`/product/${selectedProduct.cartUrl}`}>
            <Image
              alt={selectedProduct.displayName || 'Product'}
              className="object-contain"
              height={304}
              priority={priority}
              src={selectedProduct.pictureUrl}
              style={productImageDimensions}
              width={192}
            />
          </Link>
        ) : (
          // ! TODO: No image available.
          <></>
        )}
      </figure>
    ),
    [priority, productImageDimensions, selectedProduct]
  )

  return (
    <div
      className={`
        relative grid grid-cols-3 rounded-lg p-4 shadow lg:grid-cols-none
        lg:grid-rows-[19rem_1fr_auto] lg:p-6
      `}
    >
      {badges}
      {productImageLink}
      <div className="col-span-2 grid grid-rows-[1fr_auto] lg:col-span-1">
        <div className="card-body gap-0 !p-0">
          <div className="grid h-full grid-rows-2">
            <div>
              <div className="grid grid-cols-2 items-center justify-between text-sm text-neutral-500">
                <span>{selectedProduct.attributes?.Varietal}</span>
                <span className="justify-self-end text-right">
                  {selectedProduct.attributes?.['Container Size']}
                </span>
              </div>
              <Link
                className="card-title text-base font-semibold leading-normal"
                href={`/product/${selectedProduct.cartUrl}`}
              >
                {selectedProduct.displayName}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <Rating rating={Math.floor(Math.random() * 5) + 1} />
              <Price price={selectedProduct.price} onSalePrice={selectedProduct.onSalePrice} />
            </div>
          </div>
        </div>
        <div className="card-actions items-center justify-between lg:mt-6">
          {dropdownOrNumberPicker}
          <button className="btn-primary btn-sm btn lg:btn-md" onClick={onClick}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
