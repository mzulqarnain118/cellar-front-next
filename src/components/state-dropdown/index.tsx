import { useCallback, useMemo, useState } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Select, SelectProps } from '@mantine/core'
import { FieldValues, UseControllerProps, useController } from 'react-hook-form'

import { useStatesQuery } from '@/lib/queries/state'
import { State } from '@/lib/types'

export const StateDropdown = <Schema extends FieldValues>({
  className,
  size = 'md',
  ...props
}: UseControllerProps<Schema> & { className?: string; size?: 'sm' | 'md' }) => {
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

  const classNames = useMemo(
    () => ({
      error: 'text-14',
      input: 'h-10 placeholder:text-14',
      item: 'text-14',
      label: size === 'md' ? '!text-md' : '!text-14',
    }),
    [size]
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
      className={className}
      classNames={classNames}
      data={data}
      filter={filter}
      label="State"
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
