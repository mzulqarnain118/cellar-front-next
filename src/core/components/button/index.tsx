import { forwardRef } from 'react'

import { useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { Button as DaisyButton, ButtonProps as DaisyButtonProps } from 'react-daisyui'

interface ButtonProps extends DaisyButtonProps {
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
            `!enabled:border-neutral-dark cursor-not-allowed bg-neutral-dark text-neutral-50
          hover:bg-neutral-dark hover:brightness-90`,
          className
        )}
        color={dark ? 'ghost' : color || 'primary'}
      />
    )
  }
)

Button.displayName = 'Button'
