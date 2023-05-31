import { useCallback } from 'react'

import { Slider } from '@mantine/core'

import { Accordion } from '@/core/components/accordion'

const MARKS = [
  {
    label: 'All',
    value: 0,
  },
  {
    label: '$0 - $24',
    value: 33,
  },
  {
    label: '$25 - $49',
    value: 66,
  },
  {
    label: '$50+',
    value: 99,
  },
]

const sliderClassNames = {
  markLabel: 'hidden',
}

interface PriceFilterProps {
  slug: string
}

export const PriceFilter = ({ slug }: PriceFilterProps) => {
  const valueLabelFormat = useCallback(
    (value: number) => MARKS.find(mark => mark.value === value)?.label,
    []
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      <div className="space-y-2 pt-4">
        <Slider
          labelAlwaysOn
          classNames={sliderClassNames}
          color="dark"
          defaultValue={0}
          label={valueLabelFormat}
          marks={MARKS}
          step={33}
        />
      </div>
    </Accordion>
  )
}
