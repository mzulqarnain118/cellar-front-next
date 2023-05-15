import { forwardRef } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Collapse, Loader } from '@mantine/core'
import { clsx } from 'clsx'
import { Textarea as DaisyTextarea, TextareaProps as DaisyTextareaProps } from 'react-daisyui'
import { FieldValues, UseFormRegister } from 'react-hook-form'

import { Typography } from '../typogrpahy'

interface TextareaProps<TFieldValues extends FieldValues = FieldValues> extends DaisyTextareaProps {
  altLabel?: string
  dirty?: boolean
  error?: string | boolean
  id?: string
  instructionLabel?: string
  label?: string
  loading?: boolean
  minRows?: number
  name: string
  noSpacing?: boolean
  register?: UseFormRegister<TFieldValues>
  size?: 'sm' | 'md'
  touched?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      altLabel,
      className,
      dirty = false,
      error = false,
      instructionLabel,
      label,
      loading = false,
      minRows = 2,
      noSpacing = false,
      register,
      required = false,
      color: selectedColor = 'primary',
      size = 'md',
      touched = false,
      ...props
    },
    ref
  ) => {
    const valid = dirty && touched && !error
    let color = valid ? 'success' : selectedColor
    if (!valid && required) {
      color = 'error'
    }

    return (
      <div className={clsx('grid', className)}>
        <div
          className={clsx(
            'flex w-full items-center justify-center gap-2 px-0 pb-1',
            noSpacing ? 'pt-0' : 'pt-4'
          )}
        >
          <div className="form-control w-full">
            <label
              className={clsx(
                'grid',
                instructionLabel !== undefined && '!flex !items-center !justify-between'
              )}
              htmlFor={props.id || props.name}
            >
              <Typography
                className={clsx(size === 'md' && '!text-md', size === 'sm' && '!text-14')}
              >
                {label}
              </Typography>
              {instructionLabel !== undefined ? (
                <Typography className="text-sm">{instructionLabel}</Typography>
              ) : undefined}
            </label>
            <div className="relative">
              <DaisyTextarea
                ref={ref}
                bordered
                className={clsx(
                  `w-full !rounded border-base-dark bg-base-light text-neutral-dark
                    focus:!border-neutral-dark focus:!outline-none`,
                  !!error && touched && 'border-error'
                )}
                color={color}
                id={props.name}
                rows={minRows}
                {...props}
                {...register}
              />
              {valid && !loading ? (
                <CheckCircleIcon
                  className={`
                    pointer-events-none absolute inset-y-0 right-3 top-2.5 z-50 h-5 w-5
                    stroke-success stroke-2
                  `}
                />
              ) : undefined}
              {loading && !valid ? (
                <Loader
                  className={`
                    pointer-events-none absolute inset-y-0 right-3 top-2.5 z-50 h-5 w-5
                    stroke-success stroke-2
                  `}
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
          <label className="label m-0 p-0" htmlFor={props.id || props.name}>
            <Typography className="text-14 text-error">{error}</Typography>
          </label>
        </Collapse>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
