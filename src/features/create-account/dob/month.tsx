import { useState } from 'react'

import { clsx } from 'clsx'
import { FieldValues, useController } from 'react-hook-form'

import { DateOfBirthProps } from './types'

export const Month = <T extends FieldValues>({ setFocus, ...rest }: DateOfBirthProps<T>) => {
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
          h-10 rounded !rounded-r-none border-none bg-neutral
          text-center !outline-none transition-all duration-500
          placeholder:text-neutral-300 md:w-16 md:text-center
        `,
        !!error && '!border-red-700'
      )}
      id="month"
      inputMode="numeric"
      placeholder="mm"
      type="text"
      {...field}
      value={value}
      onChange={event => {
        field.onChange(event)

        const input = event.target.value
        const isNumber = !isNaN(+input)
        const firstNumber = parseInt(input.at(0) || '-1')
        const secondNumber = parseInt(input.at(1) || '-1')

        if (isNumber && input.length <= 2) {
          if (firstNumber === 0 && secondNumber === 0) {
            return
          }

          if ((firstNumber <= 1 && secondNumber <= 2) || (firstNumber === 0 && secondNumber > 0)) {
            setValue(input)

            if (input.length === 2) {
              setFocus('day')
            }
          }
        }
      }}
    />
  )
}
