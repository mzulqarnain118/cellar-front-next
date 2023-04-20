import { ComponentPropsWithoutRef, forwardRef, useMemo } from 'react'

import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core'
import { clsx } from 'clsx'

type ButtonProps = ComponentPropsWithoutRef<'button'> & MantineButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => {
    const classNames = useMemo(
      () => ({
        inner: className,
        root: clsx(
          `
            btn btn-primary enabled:hover:underline disabled:cursor-not-allowed  text-unset
          `,
          variant === 'outline' && 'btn-outline',
          variant === 'subtle' && '!btn-link !no-underline !h-auto',
          variant === 'light' && 'btn-ghost',
          size === 'sm' && 'btn-sm'
        ),
      }),
      [className, size, variant]
    )

    return <MantineButton {...props} ref={ref} classNames={classNames}></MantineButton>
  }
)

Button.displayName = 'Button'
