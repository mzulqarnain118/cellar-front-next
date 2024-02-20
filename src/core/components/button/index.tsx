import { forwardRef } from 'react'

import { useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { Button as DaisyButton, ButtonProps as DaisyButtonProps } from 'react-daisyui'

export interface ButtonProps extends DaisyButtonProps {
  dark?: boolean
  link?: boolean
  style?: any
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color, dark,style, link = false, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const selectedColor = dark ? 'ghost' : color || 'primary'

    return (
      <DaisyButton
        {...props}
        ref={ref}
        style={style}
        animation={!prefersReducedMotion}
        className={clsx(
          'rounded normal-case',
          selectedColor === 'primary' && props.variant === undefined && 'text-secondary-light',
          selectedColor === 'secondary' && props.variant === undefined && 'text-white',
          dark &&
            `text-neutral-50 hover:bg-neutral-dark hover:brightness-90 enabled:border-neutral-dark
          enabled:bg-neutral-dark disabled:cursor-not-allowed`,
          link && 'bg-transparent p-0 text-[#165250] hover:underline hover:bg-transparent border-0',
          className
        )}
        color={selectedColor}
      />
    )
  }
)

Button.displayName = 'Button'
