import { useCallback, useMemo } from 'react'

import { RangeSlider, RangeSliderProps } from '@mantine/core'

import { Accordion } from '@/core/components/accordion'
import { useFiltersStore } from '@/lib/stores/filters'

const MARKS = [
  { label: '$0', value: 0 },
  { label: '$25', value: 20 },
  { label: '$50', value: 40 },
  { label: '$75', value: 60 },
  { label: '$100', value: 80 },
  { label: 'Over $100', value: 100 },
]

const sliderClassNames = {
  markLabel: 'hidden',
}

const defaultValue: [number, number] = [0, 100]

interface PriceFilterProps {
  slug: string
}

export const PriceFilter = ({ slug }: PriceFilterProps) => {
  const { activeFilters, toggleActiveFilter, previousPriceValue, setPreviousPriceValue } =
    useFiltersStore()

  const value = useMemo(
    () =>
      activeFilters.find(element => element.name === 'price')?.value ||
      previousPriceValue ||
      defaultValue,
    [activeFilters, previousPriceValue]
  )

  const valueLabelFormat = useCallback(
    (value: number) => MARKS.find(mark => mark.value === value)?.label,
    []
  )

  const handleChangeEnd: RangeSliderProps['onChangeEnd'] = useCallback(
    (value: [number, number]) => {
      toggleActiveFilter({ name: 'price', type: 'price', value })
      setPreviousPriceValue(value)
    },
    [toggleActiveFilter, setPreviousPriceValue]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      <div className="space-y-2 pt-4">
        <RangeSlider
          labelAlwaysOn
          classNames={sliderClassNames}
          color="dark"
          label={valueLabelFormat}
          marks={MARKS}
          step={20}
          value={value}
          onChangeEnd={handleChangeEnd}
        />
      </div>
    </Accordion>
  )
}
