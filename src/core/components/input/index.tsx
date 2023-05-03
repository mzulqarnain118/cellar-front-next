import { forwardRef } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Collapse, Loader } from '@mantine/core'
import { clsx } from 'clsx'
import { Input as DaisyInput, InputProps } from 'react-daisyui'

import { Typography } from '../typogrpahy'

interface Props extends InputProps {
  altLabel?: string
  dirty?: boolean
  error?: string | boolean
  id: string
  instructionLabel?: string
  label?: string
  loading?: boolean
  touched?: boolean
  valid?: boolean
}

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      altLabel,
      className,
      dirty = false,
      error = false,
      instructionLabel,
      label,
      loading = false,
      color: selectedColor = 'primary',
      touched = false,
      valid,
      ...props
    },
    ref
  ) => {
    let color = valid && touched ? 'success' : selectedColor
    if (valid) {
      color = 'error'
    }

    return (
      <div className={clsx('grid', className)}>
        <div className="flex w-full items-center justify-center gap-2 px-0 pb-1 pt-4">
          <div className="form-control w-full">
            <label
              className={clsx(
                'grid',
                instructionLabel !== undefined && '!flex !items-center !justify-between'
              )}
              htmlFor={props.id}
            >
              <Typography className="text-md">{label}</Typography>
              {instructionLabel !== undefined ? (
                <Typography className="text-sm">{instructionLabel}</Typography>
              ) : undefined}
            </label>
            <div className="relative">
              <DaisyInput
                bordered
                className={clsx(
                  'h-10 w-full rounded border-base-dark bg-base-light text-neutral-dark focus:!border-neutral-dark focus:!outline-none',
                  error !== undefined && touched && 'border-error',
                  error !== undefined && dirty && `border-${color}`
                )}
                color={color}
                {...props}
                ref={ref}
              />
              {valid && !loading ? (
                <CheckCircleIcon className="pointer-events-none absolute inset-y-0 right-4 top-1.5 z-50 h-7 w-7 stroke-success stroke-2" />
              ) : undefined}
              {loading && !valid ? (
                <Loader
                  className="pointer-events-none absolute inset-y-0 right-4 top-1.5 z-50 h-7 w-7 stroke-success stroke-2"
                  size="sm"
                />
              ) : undefined}
            </div>
            {altLabel !== undefined ? (
              <Typography className="label-text-alt">{altLabel}</Typography>
            ) : undefined}
          </div>
        </div>
        <Collapse in={error !== undefined && typeof error === 'string'}>
          <label className="label m-0 p-0" htmlFor={props.id}>
            <Typography className="text-14 text-error">{error}</Typography>
          </label>
        </Collapse>
      </div>
    )
  }
)

Input.displayName = 'Input'
