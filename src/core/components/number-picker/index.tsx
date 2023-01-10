import { ChangeEventHandler, MouseEventHandler, useRef, useState } from 'react'

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
  handleChange?: (newValue: number) => void
  /** Callback for when the remove button is pressed. */
  handleRemove?: MouseEventHandler<HTMLButtonElement>
  /** Initial value for the picker. Defaults to 1. Value must be positive. */
  initialValue?: number
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
  handleRemove,
  initialValue = 1,
  max = 24,
  min = 1,
}: NumberPickerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState(initialValue <= 0 ? 1 : initialValue)

  const onChange: ChangeEventHandler<HTMLInputElement> = event => {
    if (min <= 0 || max <= 0) {
      return
    }

    const parsedValue = parseInt(event.target.value || '0')
    let newValue = 0
    if (parsedValue >= min && parsedValue <= max) {
      newValue = parsedValue
    } else if (parsedValue < min) {
      newValue = min
    } else if (parsedValue > max) {
      newValue = max
    }
    setValue(newValue)

    if (parsedValue > 0 && handleChange !== undefined) {
      handleChange(newValue)
    }
  }

  const onRemove: MouseEventHandler<HTMLButtonElement> = event => {
    console.log(value)
    if (value === 1 && handleRemove) {
      handleRemove(event)
    } else if (value > 1 && handleChange) {
      handleChange(value - 1)
    }
  }

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
        className={`
          flex h-10 w-8 items-center justify-center rounded-lg rounded-r-none hover:bg-neutral-100
        `}
        disabled={disabled}
        type="button"
        onClick={onRemove}
      >
        <MinusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </button>
      <input
        ref={inputRef}
        aria-label="Product Quantity"
        className={`
          w-10 appearance-none border-neutral-100 border-y-transparent bg-neutral-50 p-0
          text-center transition-all focus:border-y
        `}
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        pattern="[0-9]+"
        type="number"
        value={value}
        onChange={onChange}
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
        disabled={disabled}
        type="button"
        onClick={handleAdd}
      >
        <PlusIcon height={BUTTON_SIZE} width={BUTTON_SIZE} />
      </button>
    </div>
  )
}
