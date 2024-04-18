import { useCallback, useMemo } from 'react'

import { Collapse, Radio, RadioProps } from '@mantine/core'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'
import { useProductQuery } from '@/lib/queries/products'

import { usePdpActions, usePdpSelectedOption, usePdpSelectedProduct } from '../../store'

import { Option, RadioOption } from './radio-option'

const radioClassNames: RadioProps['classNames'] = {
  labelWrapper: 'w-full text-base',
}

interface VariationMap {
  [variationTypeName: string]: Option[]
}

interface OptionsProps {
  cartUrl: string
}

export const Options = ({ cartUrl }: OptionsProps) => {
  const { data: flightData } = useProductQuery(cartUrl)
  const selectedOption = usePdpSelectedOption()
  const selectedProduct = usePdpSelectedProduct()
  const { setSelectedOption, setSelectedProduct } = usePdpActions()

  const handleOneTimeChange = useCallback(() => {
    setSelectedOption('one-time')
    setSelectedProduct(flightData || undefined)
  }, [flightData, setSelectedOption, setSelectedProduct])

  const handleSubscriptionChange = useCallback(() => {
    setSelectedOption('subscription')

    if (flightData?.subscriptionProduct !== undefined) {
      const { subscriptionProduct } = flightData
      const variationName = subscriptionProduct.variations?.filter(variation => variation.active)[0]
        ?.variations?.[0]?.option
      setSelectedProduct({
        ...subscriptionProduct,
        displayName: `${subscriptionProduct.displayName} (${variationName})`,
        onSalePrice: subscriptionProduct.price,
        price: flightData?.price,
        sku: subscriptionProduct.sku,
      })
    }
  }, [flightData, setSelectedOption, setSelectedProduct])

  const variationMap = useMemo(
    () =>
      selectedProduct?.variations
        ?.filter(item => item.active)
        .reduce<VariationMap>((variationMapObject, variation) => {
          if (variation.variations !== undefined && variation.variations.length > 0) {
            const option = {
              optionName: variation.variations[0].option,
              sku: variation.sku,
            }
            if (variation.variations[0].type in variationMapObject) {
              variationMapObject[variation.variations[0].type] = [
                ...variationMapObject[variation.variations[0].type],
                option,
              ]
            } else {
              variationMapObject[variation.variations[0].type] = [option]
            }
          }

          return variationMapObject
        }, {}),
    [selectedProduct?.variations]
  )

  const variations = useMemo(
    () =>
      variationMap !== undefined
        ? Object.entries(variationMap).map(([variation, options]) => (
            <div key={variation}>
              <Typography as="p">{variation}</Typography>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {options.map(option => (
                  <RadioOption key={option.sku} cartUrl={cartUrl} option={option} />
                ))}
              </div>
            </div>
          ))
        : undefined,
    [cartUrl, variationMap]
  )

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Radio
          checked={selectedOption === 'one-time'}
          className={clsx(
            'rounded border-2 border-neutral-light px-4 py-3 transition-colors',
            selectedOption === 'one-time' && '!border-neutral-dark'
          )}
          classNames={radioClassNames}
          color="dark"
          label="One-time purchase"
          size="lg"
          onChange={handleOneTimeChange}
        />
        <Radio
          checked={selectedOption === 'subscription'}
          className={clsx(
            'rounded border-2 border-neutral-light px-4 py-3 transition-colors',
            selectedOption === 'subscription' && '!border-neutral-dark'
          )}
          classNames={radioClassNames}
          color="dark"
          label="Auto-Sip™"
          size="lg"
          onChange={handleSubscriptionChange}
        />
      </div>
      <Collapse in={selectedOption === 'subscription'}>{variations}</Collapse>
    </>
  )
}
