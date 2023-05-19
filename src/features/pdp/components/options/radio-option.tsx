import { useCallback } from 'react'

import { Radio, RadioProps } from '@mantine/core'
import { clsx } from 'clsx'

import { useProductQuery } from '@/lib/queries/products'

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
    }
  }, [flightData, option.optionName, option.sku, setSelectedProduct])

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
