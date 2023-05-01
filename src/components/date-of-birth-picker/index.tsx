import { useState } from 'react'

import { TextInput } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
// import { PreCheckoutSchema } from '@/features/cart/checkout-drawer'

// const dayStyles: TextInputProps['styles'] = {
//   input: {
//     borderLeft: '0',
//     borderRadius: '0',
//     borderRight: '0',
//     padding: '0',
//     textAlign: 'center',
//   },
// }
// const yearStyles: TextInputProps['styles'] = {
//   input: {
//     borderBottomLeftRadius: '0',
//     borderLeft: '0',
//     borderTopLeftRadius: '0',
//     padding: '0',
//   },
// }

export const DateOfBirthPicker = () => {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const {
    formState: { dirtyFields: _, errors },
    register,
    setFocus,
  } = useFormContext()
  const hasError = !!(errors.month?.message || errors.day?.message || errors.year?.message)
  // const error = errors.month?.message || errors.day?.message || errors.year?.message
  // const allDirty = dirtyFields.month && dirtyFields.day && dirtyFields.year

  return (
    <div className="">
      <Typography className="mb-1 text-14">Date of birth</Typography>
      <div className="flex items-end">
        <Input
          className="rounded-r-0"
          error={hasError}
          id="month"
          {...register('month', {
            onChange: event => {
              const input = event.target.value
              const isNumber = !isNaN(+input)
              const firstNumber = parseInt(input.at(0) || '-1')
              const secondNumber = parseInt(input.at(1) || '-1')

              if (isNumber && input.length <= 2) {
                if (firstNumber === 0 && secondNumber === 0) {
                  return
                }

                if (
                  (firstNumber <= 1 && secondNumber <= 2) ||
                  (firstNumber === 0 && secondNumber > 0)
                ) {
                  setMonth(input)

                  if (input.length === 2) {
                    setFocus('day')
                  }
                }
              }
            },
          })}
          value={month}
        />
        <Input
          className="rounded-r-0 border-l-0 border-r-0 p-0 text-center"
          error={hasError}
          id="day"
          // styles={dayStyles}
          {...register('day', {
            onChange: event => {
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

                setDay(input)

                if (input.length === 2) {
                  setFocus('year')
                }
              }
            },
          })}
          value={day}
        />
        <TextInput
          error={hasError}
          // rightSection={
          //   !hasError && allDirty ? (
          //     <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
          //   ) : undefined
          // }
          // styles={yearStyles}
          {...register('year', {
            onChange: event => {
              const input = event.target.value
              const isNumber = !isNaN(+input)

              if (input.length === 0) {
                setFocus('day')
              }

              if (isNumber && input.length <= 4) {
                setYear(input)
              }
            },
          })}
          value={year}
        />
      </div>
      <Typography className="text-sm" color="error">
        {/* {error} */}
      </Typography>
    </div>
  )
}
