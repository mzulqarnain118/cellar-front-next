import { useCallback, useMemo, useState } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Select, SelectProps } from '@mantine/core'
import { UseControllerProps, useController } from 'react-hook-form'

// import { DeliverySchema } from '@/features/checkout/delivery'
import { useStatesQuery } from '@/lib/queries/state'
import { State } from '@/lib/types'

// type Schema = DeliverySchema

export const StateDropdown = (props: UseControllerProps) => {
  const {
    field,
    fieldState: { error, isDirty },
  } = useController(props)
  const [value, setValue] = useState<string | null>('')
  const { data: states } = useStatesQuery()
  const data = useMemo(
    () =>
      states !== undefined
        ? states.map(state => ({
            data: state,
            label: state.name,
            value: state.provinceID.toString(),
          }))
        : [],
    [states]
  )

  const filter: SelectProps['filter'] = useCallback(
    (searchValue: string, item: { data: State; value: string }) =>
      item.data.name.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      item.data.abbreviation.toLowerCase().includes(searchValue.toLowerCase().trim()),
    []
  )

  const onChange = useCallback(
    (newState: string | null) => {
      field.onChange({ target: { value: newState } })
      setValue(newState)
    },
    [field]
  )

  return (
    <Select
      searchable
      data={data}
      filter={filter}
      label="State"
      placeholder="Select your shipping state"
      {...field}
      error={error?.message}
      rightSection={
        error?.message === undefined && isDirty ? (
          <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
        ) : undefined
      }
      value={value}
      onChange={onChange}
    />
  )
}
