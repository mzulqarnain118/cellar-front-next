import { CSSProperties, useCallback, useMemo, useState } from 'react'

import { clsx } from 'clsx'
import { useFormContext } from 'react-hook-form'

import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'

interface DateOfBirthProps {
  defaultValue?: {
    day: number | string
    month: number | string
    year: number | string
  }
  noSpacing?: boolean
}

export const DateOfBirthPicker = ({ defaultValue, noSpacing = false }: DateOfBirthProps) => {
  const [month, setMonth] = useState(defaultValue?.month?.toString() || '')
  const [day, setDay] = useState(defaultValue?.day?.toString() || '')
  const [year, setYear] = useState(defaultValue?.year?.toString() || '')
  const [focused, setFocused] = useState(false)
  const {
    formState: { errors },
    register,
    setFocus,
  } = useFormContext({
    defaultValues: defaultValue
  })
  const hasError = !!(errors.month?.message || errors.day?.message || errors.year?.message)
  const error = errors.month?.message || errors.day?.message || errors.year?.message

  const monthStyles: CSSProperties = useMemo(
    () => ({
      borderColor: focused ? '#312c2c' : '',
      borderRadius: '0.25rem 0rem 0rem 0.25rem',
      borderRightWidth: 0,
    }),
    [focused]
  )

  const dayStyles: CSSProperties = useMemo(
    () => ({
      borderColor: focused ? '#312c2c' : '',
      borderLeftWidth: 0,
      borderRadius: '0rem',
      borderRightWidth: 0,
      textAlign: 'center' as const,
    }),
    [focused]
  )

  const yearStyles: CSSProperties = useMemo(
    () => ({
      borderColor: focused ? '#312c2c' : '',
      borderLeftWidth: 0,
      borderRadius: '0rem 0.25rem 0.25rem 0rem',
      textAlign: 'right' as const,
    }),
    [focused]
  )

  const handleFocus = useCallback(() => setFocused(true), [])

  return (
    <div className={clsx(!noSpacing && 'pt-4')}>
      <Typography as="label" className="mb-1 text-md" htmlFor="month">
        Date of birth
      </Typography>
      <div className="flex items-start bg-base-light">
        <Input
          noSpacing
          error={hasError}
          placeholder="mm"
          style={monthStyles}
          type="tel"
          {...register('month', {
            onBlur: () => setFocused(false),
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
          // value={month}
          onFocus={handleFocus}
        />
        <Typography
          className={clsx(
            'border-y border-base-dark h-10 inline-flex items-center justify-center',
            focused && 'border-neutral-dark'
          )}
        >
          /
        </Typography>
        <Input
          noSpacing
          error={hasError}
          placeholder="dd"
          style={dayStyles}
          type="tel"
          {...register('day', {
            onBlur: () => setFocused(false),
            onChange: event => {
              const input = event.target.value

              console.log("🚀 ~ DateOfBirthPicker ~ input:", input)

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
          // value={day}
          onFocus={handleFocus}
        />
        <Typography
          className={clsx(
            'border-y border-base-dark h-10 inline-flex items-center justify-center',
            focused && 'border-neutral-dark'
          )}
        >
          /
        </Typography>
        <Input
          noSpacing
          error={hasError}
          placeholder="yyyy"
          style={yearStyles}
          type="tel"
          {...register('year', {
            onBlur: () => setFocused(false),
            onChange: event => {
              const input = event.target.value

              console.log("🚀 ~ DateOfBirthPicker ~ input:", input)

              const isNumber = !isNaN(+input)

              if (input.length === 0) {
                setFocus('day')
              }

              if (isNumber && input.length <= 4) {
                setYear(input)
              }
            },
          })}
          // value={year}
          onFocus={handleFocus}
        />
      </div>
      <Typography className="text-14 text-error">{error?.toString()}</Typography>
    </div>
  )
}
