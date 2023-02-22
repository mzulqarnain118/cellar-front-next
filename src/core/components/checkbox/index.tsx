import { ChangeEvent, useId } from 'react'

import { clsx } from 'clsx'

interface CheckboxProps {
  checked?: boolean
  className?: string
  containerClassName?: string
  disabled?: boolean
  label: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export const Checkbox = ({
  checked = false,
  className,
  containerClassName,
  disabled = false,
  label,
  onChange,
}: CheckboxProps) => {
  const checkboxId = useId()

  return (
    <div className={clsx('group flex items-center gap-2', containerClassName)}>
      <input
        checked={checked}
        className={clsx(
          `
            form-checkbox h-4 w-4 cursor-pointer rounded border border-neutral-300
            bg-neutral-50 transition duration-200 checked:border-brand-500
            checked:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500
            disabled:cursor-not-allowed disabled:!border-neutral-200 disabled:!bg-neutral-300
            group-hover:bg-brand-200 group-hover:checked:bg-brand-500
          `,
          className
        )}
        disabled={disabled}
        id={checkboxId}
        type="checkbox"
        value={label}
        onChange={onChange}
      />
      <label
        className={clsx(
          'cursor-pointer text-neutral-600',
          disabled && 'cursor-not-allowed text-neutral-400'
        )}
        htmlFor={checkboxId}
      >
        {label}
      </label>
    </div>
  )
}
