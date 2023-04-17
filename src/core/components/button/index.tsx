import { ComponentPropsWithoutRef, forwardRef, useMemo } from 'react'

import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core'
import { clsx } from 'clsx'

type ButtonProps = ComponentPropsWithoutRef<'button'> & MantineButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    const classNames = useMemo(
      () => ({
        root: clsx(
          `
            btn btn-primary enabled:hover:underline disabled:cursor-not-allowed
          `,
          className,
          variant === 'outline' && 'btn-outline',
          variant === 'subtle' && '!btn-link !no-underline !h-auto',
          variant === 'light' && 'btn-ghost'
        ),
      }),
      [className, variant]
    )

    return <MantineButton {...props} ref={ref} classNames={classNames}></MantineButton>
  }
)

Button.displayName = 'Button'
