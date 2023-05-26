import { useState } from 'react'

import { clsx } from 'clsx'
import { FieldValues, useController } from 'react-hook-form'

import { Typography } from '@/core/components/typogrpahy'

import { DateOfBirthProps } from './types'

export const Day = <T extends FieldValues>({ setFocus, ...rest }: DateOfBirthProps<T>) => {
  const {
    field,
    formState: { errors },
  } = useController(rest)
  const [value, setValue] = useState('')
  const error = errors.month?.message || errors.day?.message || errors.year?.message

  const slash = (
    <Typography
      className={clsx(
        `
          inline-flex items-center justify-center text-xl text-neutral-500 transition-all
          duration-500 md:h-10 md:bg-neutral
        `,
        !!error && '!border-error'
      )}
    >
      /
    </Typography>
  )

  return (
    <>
      {slash}
      <input
        className={clsx(
          `
            h-10 rounded !rounded-l-none !rounded-r-none border-none bg-neutral
            text-center !outline-none transition-all duration-500 placeholder:text-neutral-300
            md:w-14
          `,
          !!error && '!border-error'
        )}
        id="day"
        inputMode="numeric"
        placeholder="dd"
        type="text"
        {...field}
        value={value}
        onChange={event => {
          field.onChange(event)

          const input = event.target.value
          const isNumber = !isNaN(+input)
          const firstNumber = parseInt(input.at(0) || '-1')
          const secondNumber = parseInt(input.at(1) || '-1')

          if (input.length === 0) {
            setFocus('month')
          }

          if (isNumber && firstNumber <= 3 && input.length <= 2) {
            if (
              (firstNumber === 0 && secondNumber === 0) ||
              (firstNumber === 3 && secondNumber > 1)
            ) {
              return
            }

            setValue(input)

            if (input.length === 2) {
              setFocus('year')
            }
          }
        }}
      />
      {slash}
    </>
  )
}
