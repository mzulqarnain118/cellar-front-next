import { useState } from 'react'

import { clsx } from 'clsx'
import { FieldValues, useController } from 'react-hook-form'

import { DateOfBirthProps } from './types'

export const Year = <T extends FieldValues>({ setFocus, ...rest }: DateOfBirthProps<T>) => {
  const {
    field,
    formState: { errors },
  } = useController(rest)
  const [value, setValue] = useState('')
  const error = errors.month?.message || errors.day?.message || errors.year?.message

  return (
    <input
      className={clsx(
        `
          h-10 rounded-lg !rounded-l-none border-none bg-[#EFEFEF]
          !outline-none transition-all duration-500
          placeholder:text-[#7C7C7C]
        `,
        !!error && '!border-red-700'
      )}
      id="year"
      inputMode="numeric"
      placeholder="yyyy"
      type="text"
      {...field}
      value={value}
      onChange={event => {
        field.onChange(event)

        const input = event.target.value
        const isNumber = !isNaN(+input)

        if (input.length === 0) {
          setFocus('day')
        }

        if (isNumber && input.length <= 4) {
          setValue(input)
        }
      }}
    />
  )
}
