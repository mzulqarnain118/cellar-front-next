import { ReactNode, forwardRef } from 'react'

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Collapse, Loader } from '@mantine/core'
import { clsx } from 'clsx'
import { Input as DaisyInput, InputGroup, InputProps } from 'react-daisyui'
import { FieldValues, UseFormRegister } from 'react-hook-form'

import { Typography } from '../typogrpahy'

interface Props<TFieldValues extends FieldValues = FieldValues> extends InputProps {
  altLabel?: string
  dirty?: boolean
  error?: string | boolean
  id?: string
  inputClassName?: string
  instructionLabel?: string
  label?: string
  left?: ReactNode
  loading?: boolean
  name: string
  noSpacing?: boolean
  register?: UseFormRegister<TFieldValues>
  right?: ReactNode
  size?: 'sm' | 'md'
  touched?: boolean
  values?: any
}

export const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      altLabel,
      className,
      dirty = false,
      error = false,
      inputClassName,
      instructionLabel,
      label,
      left,
      loading = false,
      noSpacing = false,
      register,
      required = false,
      right,
      color: selectedColor = 'primary',
      size = 'md',
      touched = false,
      values,
      ...props
    },
    ref
  ) => {
    const valid = dirty && touched && !error
    let color = valid ? 'success' : selectedColor
    if (!valid && required) {
      color = 'error'
    }

    const Wrapper = left !== undefined || right !== undefined ? InputGroup : 'div'

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
              <Wrapper
                className={
                  left !== undefined || right !== undefined
                    ? '[&>*]:bg-inherit [&>*]:p-0'
                    : undefined
                }
              >
                {left !== undefined ? (
                  <Typography className="!rounded-l border border-base-dark">{left}</Typography>
                ) : undefined}
                <DaisyInput
                  ref={ref}
                  bordered
                  className={clsx(
                    `h-10 w-full rounded border-base-dark bg-base-light text-neutral-dark
                    focus:!border-neutral-dark focus:!outline-none`,
                    left !== undefined && '!rounded-l-none !px-4',
                    right !== undefined && '!rounded-r-none !px-4',
                    !!error && touched && '!border-error',
                    inputClassName
                  )}
                  color={color}
                  id={props.name}
                  {...props}
                  {...register}
                />
                { label === "CVV" ? (
                  valid || (props?.name==="cvv" &&props?.value?.length>=3)?
                  <CheckCircleIcon
                    className={`
                    pointer-events-none absolute inset-y-0 right-1 top-1 z-50 h-8 w-8
                    stroke-success stroke-2
                  `}
                  />: <XCircleIcon
                    className={`
                    pointer-events-none absolute inset-y-0 right-1 top-1 z-50 h-8 w-8
                    stroke-error stroke-2
                  `}
                  />
                ) : right !== undefined ? (
                  <Typography className="!rounded-r">{right}</Typography>
                ) : undefined}
              </Wrapper>
              {valid && !loading && label !== "CVV" ? (
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

Input.displayName = 'Input'
