import { useMemo } from 'react'

import { Collapse } from '@mantine/core'

import { Typography } from '@/core/components/typogrpahy'

import { usePdpSelectedProduct } from '../../store'
import { Option, RadioOption } from '../options/radio-option'

interface VariationMap {
  [variationTypeName: string]: Option[]
}

interface VariationsProps {
  cartUrl: string
}

export const Variations = ({ cartUrl }: VariationsProps) => {
  const selectedProduct = usePdpSelectedProduct()

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

  return <Collapse in={variations !== undefined && variations.length > 0}>{variations}</Collapse>
}
