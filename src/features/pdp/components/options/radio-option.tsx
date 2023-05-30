import { useCallback } from 'react'

import { Radio, RadioProps } from '@mantine/core'
import { clsx } from 'clsx'

import { useProductQuery } from '@/lib/queries/products'

import { useProductDetails } from '../../queries/product-details'
import { usePdpActions, usePdpSelectedProduct } from '../../store'

export interface Option {
  optionName: string
  sku: string
}

interface OptionProps {
  cartUrl: string
  option: Option
}

const radioClassNames: RadioProps['classNames'] = {
  labelWrapper: 'w-full text-base',
}

export const RadioOption = ({ cartUrl, option }: OptionProps) => {
  const { data: flightData } = useProductQuery(cartUrl)
  const { setSelectedProduct } = usePdpActions()
  const selectedProduct = usePdpSelectedProduct()
  const { data: productDetails } = useProductDetails(option.sku)

  const handleVariationChange = useCallback(() => {
    if (flightData?.subscriptionProduct !== undefined) {
      const { subscriptionProduct } = flightData
      setSelectedProduct({
        ...subscriptionProduct,
        displayName: `${subscriptionProduct.displayName} (${option.optionName})`,
        onSalePrice: subscriptionProduct.price,
        price: flightData?.price,
        sku: option.sku,
      })
    } else if (flightData?.variations !== undefined && flightData.variations.length > 0) {
      if (productDetails !== undefined) {
        setSelectedProduct({
          ...selectedProduct,
          cartUrl: selectedProduct?.cartUrl || '',
          catalogId: 0,
          displayCategories: selectedProduct?.displayCategories || [],
          displayName: `${flightData?.displayName} (${option.optionName})` || '',
          isAutoSip: false,
          isClubOnly: selectedProduct?.isClubOnly || false,
          isGift: selectedProduct?.isGift || false,
          isGiftCard: selectedProduct?.isGiftCard || false,
          isScoutCircleClub: selectedProduct?.isScoutCircleClub || false,
          isVip: false,
          onSalePrice: productDetails?.ComparePrice || selectedProduct?.onSalePrice || 0,
          price: productDetails?.Price || selectedProduct?.price || 0,
          quantityAvailable:
            productDetails?.QuantityAvailable || selectedProduct?.quantityAvailable || 0,
          sku: productDetails?.SKU.toLowerCase() || selectedProduct?.sku || '',
          subscribable: productDetails?.SubscriptionOnly || selectedProduct?.subscribable || false,
        })
      }
    }
  }, [
    flightData,
    option.optionName,
    option.sku,
    productDetails,
    selectedProduct,
    setSelectedProduct,
  ])

  return (
    <Radio
      checked={selectedProduct?.sku === option.sku}
      className={clsx(
        'rounded border-2 border-neutral-light px-4 py-3 transition-colors',
        selectedProduct?.sku === option.sku && '!border-neutral-dark'
      )}
      classNames={radioClassNames}
      color="dark"
      label={option.optionName}
      size="lg"
      onChange={handleVariationChange}
    />
  )
}
