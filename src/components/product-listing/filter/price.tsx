import { useCallback, useMemo } from 'react'

import { RangeSlider, RangeSliderProps } from '@mantine/core'

import { Accordion } from '@/core/components/accordion'
import { useFiltersStore } from '@/lib/stores/filters'

const MARKS = [
  {
    label: 'Under $25',
    value: 0,
  },
  {
    label: '$25-$50',
    value: 33,
  },
  {
    label: '$50-$75',
    value: 66,
  },
  {
    label: 'Over $75',
    value: 99,
  },
]

const sliderClassNames = {
  markLabel: 'hidden',
}

const defaultValue: [number, number] = [0, 99]

interface PriceFilterProps {
  slug: string
}

export const PriceFilter = ({ slug }: PriceFilterProps) => {
  const { activeFilters, removeFilter, toggleActiveFilter } = useFiltersStore()

  const value = useMemo(
    () => activeFilters.find(element => element.name === 'price')?.value || defaultValue,
    [activeFilters]
  )

  const valueLabelFormat = useCallback(
    (value: number) => MARKS.find(mark => mark.value === value)?.label,
    []
  )

  const handleChangeEnd: RangeSliderProps['onChangeEnd'] = useCallback(
    (value: [number, number]) => {
      if (value[0] === 0 && value[1] === 99) {
        removeFilter({ name: 'price', type: 'price' })
      } else {
        toggleActiveFilter({ name: 'price', type: 'price', value })
      }
    },
    [removeFilter, toggleActiveFilter]
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
          step={33}
          value={value}
          onChangeEnd={handleChangeEnd}
        />
      </div>
    </Accordion>
  )
}
