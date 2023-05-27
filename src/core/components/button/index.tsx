import { forwardRef } from 'react'

import { useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { Button as DaisyButton, ButtonProps as DaisyButtonProps } from 'react-daisyui'

export interface ButtonProps extends DaisyButtonProps {
  dark?: boolean
  link?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color, dark, link = false, ...props }, ref) => {
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
          link && 'bg-transparent p-0 text-[#b7725b] hover:underline hover:bg-transparent border-0',
          className
        )}
        color={dark ? 'ghost' : color || 'primary'}
      />
    )
  }
)

Button.displayName = 'Button'
