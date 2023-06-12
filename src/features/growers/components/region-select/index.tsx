import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'

import { Select } from '@mantine/core'

import { Typography } from '@/core/components/typogrpahy'

interface RegionSelectProps {
  onChange: Dispatch<SetStateAction<string>>
  state: string
  states: { label: string; value: string }[]
}

export const RegionSelect = ({ onChange, state, states }: RegionSelectProps) => {
  const [label, setLabel] = useState('United States of America')

  const options = useMemo(
    () => [
      {
        label: 'Select...',
        value: '',
      },
      ...states,
    ],
    [states]
  )

  const handleChange = useCallback(
    (value: string) => {
      const target = options.find(item => item.value === value)

      setLabel(value && target !== undefined ? target.label : 'United States of America')
      onChange(value)
    },
    [onChange, options]
  )

  return (
    <div className="text-center py-6">
      <Typography as="h3" className="mb-4">
        Select Region
      </Typography>
      <Select
        className="max-w-xs mx-auto"
        data={options}
        label={label}
        value={state}
        onChange={handleChange}
      />
    </div>
  )
}
