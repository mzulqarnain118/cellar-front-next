import { ChangeEventHandler, MouseEventHandler, useCallback, useRef } from 'react'

import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Button } from '@mantine/core'
import { clsx } from 'clsx'

interface NumberPickerProps {
  /** Container class name. */
  containerClassName?: string
  /** Disable the number picker. Defaults to false. */
  disabled?: boolean
  /** Callback for when the add button is pressed. */
  handleAdd?: MouseEventHandler<HTMLButtonElement>
  /** Callback for when the value in the text input changes. */
  handleChange?: ChangeEventHandler<HTMLInputElement>
  /** Callback for when the remove button is pressed. */
  handleMinus?: MouseEventHandler<HTMLButtonElement>
  /** Initial value for the picker. Defaults to 1. Value must be positive. */
  value: number
  /** Maximum value of the number picker. Defaults to 24. Value must be positive. */
  max?: number
  /** Minimum value of the number picker. Defaults to 1. Value must be positive. */
  min?: number
  size?: 'sm' | 'md'
}

const BUTTON_SIZE = 16

export const NumberPicker = ({
  containerClassName,
  disabled,
  handleAdd,
  handleChange,
  handleMinus,
  value,
  max = 24,
  min = 1,
  size = 'md',
}: NumberPickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select()
    }
  }, [])

  return (
    <div className={clsx('flex items-center rounded', containerClassName)}>
      <Button
        aria-label="Remove 1"
        className={clsx(
          `
            flex h-10 w-8 items-center justify-center rounded rounded-r-none border-solid
            border-neutral-400 bg-neutral-50 text-neutral-700 transition
            enabled:hover:bg-neutral-700 enabled:hover:text-neutral-50
            disabled:cursor-not-allowed
          `,
          value === min && 'cursor-not-allowed',
          size === 'sm' && 'h-8 w-6'
        )}
        disabled={disabled}
        type="button"
        variant="light"
        onClick={handleMinus}
      >
        <MinusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </Button>
      <input
        ref={inputRef}
        aria-label="Product Quantity"
        className={clsx(
          `
            w-10 appearance-none border-x-0 border-y border-solid border-neutral-400
            bg-neutral-100 p-0 text-center transition-all disabled:cursor-not-allowed
            disabled:border-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-200
          `,
          disabled && 'disabled:bg-neutral-100 disabled:text-neutral-200',
          size === 'sm' && '!h-8',
          size === 'md' && '!h-10'
        )}
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        pattern="[0-9]+"
        type="number"
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
      />
      <Button
        aria-label="Add 1"
        className={clsx(
          `
            flex h-10 w-8 items-center justify-center rounded rounded-l-none border-solid
            border-neutral-400 bg-neutral-50 text-neutral-700 transition
            enabled:hover:bg-neutral-700 enabled:hover:text-neutral-50
            disabled:cursor-not-allowed
          `,
          size === 'sm' && 'h-8 w-6'
        )}
        disabled={disabled || value === max}
        type="button"
        variant="light"
        onClick={handleAdd}
      >
        <PlusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </Button>
    </div>
  )
}
