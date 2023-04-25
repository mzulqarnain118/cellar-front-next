import { useState } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Text, TextInput, TextInputProps } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { PreCheckoutSchema } from '@/features/cart/checkout-drawer'

const monthStyles: TextInputProps['styles'] = {
  input: {
    borderBottomRightRadius: '0',
    borderRight: '0',
    borderTopRightRadius: '0',
    padding: '0',
    textAlign: 'center',
  },
}
const dayStyles: TextInputProps['styles'] = {
  input: {
    borderLeft: '0',
    borderRadius: '0',
    borderRight: '0',
    padding: '0',
    textAlign: 'center',
  },
}
const yearStyles: TextInputProps['styles'] = {
  input: {
    borderBottomLeftRadius: '0',
    borderLeft: '0',
    borderTopLeftRadius: '0',
    padding: '0',
  },
}

export const DateOfBirthPicker = () => {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const {
    formState: { dirtyFields, errors },
    register,
    setFocus,
  } = useFormContext<PreCheckoutSchema>()
  const hasError = !!(errors.month?.message || errors.day?.message || errors.year?.message)
  const error = errors.month?.message || errors.day?.message || errors.year?.message
  const allDirty = dirtyFields.month && dirtyFields.day && dirtyFields.year

  return (
    <div className="">
      <Text className="mb-1" size="sm">
        Date of birth
      </Text>
      <div className="flex items-end">
        <TextInput
          error={hasError}
          styles={monthStyles}
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
        <TextInput
          error={hasError}
          styles={dayStyles}
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
          rightSection={
            !hasError && allDirty ? (
              <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
            ) : undefined
          }
          styles={yearStyles}
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
      <Text color="error" size="xs">
        {error}
      </Text>
    </div>
  )
}
