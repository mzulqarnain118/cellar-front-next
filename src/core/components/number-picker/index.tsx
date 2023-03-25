import { ChangeEventHandler, MouseEventHandler, useRef } from 'react'

import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'

interface NumberPickerProps {
  /** Container class name. */
  containerClassName?: string
  /** Disable the number picker. Defaults to false. */
  disabled?: boolean
  /** Callback for when the add button is pressed. */
  handleAdd?: MouseEventHandler<HTMLButtonElement>
  /** Callback for when the value in the text input changes. */
  handleChange?: ChangeEventHandler
  /** Callback for when the remove button is pressed. */
  handleMinus?: MouseEventHandler<HTMLButtonElement>
  /** Initial value for the picker. Defaults to 1. Value must be positive. */
  value: number
  /** Maximum value of the number picker. Defaults to 24. Value must be positive. */
  max?: number
  /** Minimum value of the number picker. Defaults to 1. Value must be positive. */
  min?: number
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
}: NumberPickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div
      className={clsx(
        `
          flex items-center rounded-lg border border-neutral-200 bg-neutral-50
          text-neutral-500
        `,
        containerClassName
      )}
    >
      <button
        aria-label="Remove 1"
        className={clsx(
          `
          flex h-10 w-8 items-center justify-center rounded-lg rounded-l-none transition
          hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100
          disabled:text-neutral-200
        `,
          value === min && 'cursor-not-allowed'
        )}
        disabled={disabled}
        type="button"
        onClick={handleMinus}
      >
        <MinusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </button>
      <input
        ref={inputRef}
        aria-label="Product Quantity"
        className={clsx(
          `
            w-10 appearance-none border-neutral-100 border-y-transparent bg-neutral-50 p-0
            text-center transition-all focus:border-y disabled:cursor-not-allowed
            disabled:bg-neutral-100 disabled:text-neutral-200
          `,
          disabled && 'disabled:bg-neutral-100 disabled:text-neutral-200'
        )}
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        pattern="[0-9]+"
        type="number"
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (inputRef.current) {
            inputRef.current.select()
          }
        }}
      />
      <button
        aria-label="Add 1"
        className={`
          flex h-10 w-8 items-center justify-center rounded-lg rounded-l-none transition
          hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-100
          disabled:text-neutral-200
        `}
        disabled={disabled || value === max}
        type="button"
        onClick={handleAdd}
      >
        <PlusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </button>
    </div>
  )
}
