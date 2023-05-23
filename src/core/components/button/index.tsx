import { forwardRef } from 'react'

import { useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { Button as DaisyButton, ButtonProps as DaisyButtonProps } from 'react-daisyui'

export interface ButtonProps extends DaisyButtonProps {
  dark?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color, dark, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <DaisyButton
        {...props}
        ref={ref}
        animation={!prefersReducedMotion}
        className={clsx(
          'rounded',
          'normal-case',
          dark &&
            `text-neutral-50 hover:bg-neutral-dark hover:brightness-90 enabled:border-neutral-dark
          enabled:bg-neutral-dark disabled:cursor-not-allowed`,
          className
        )}
        color={dark ? 'ghost' : color || 'primary'}
      />
    )
  }
)

Button.displayName = 'Button'
