import { forwardRef, useMemo } from 'react'

import { PasswordInput as MantinePasswordInput, PasswordInputProps } from '@mantine/core'
import { clsx } from 'clsx'

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props: PasswordInputProps, ref) => {
    const classNames: PasswordInputProps['classNames'] = useMemo(
      () => ({ input: clsx(props.error !== undefined && 'focus:!text-neutral-dark') }),
      [props.error]
    )
    return <MantinePasswordInput {...props} ref={ref} classNames={classNames} />
  }
)

PasswordInput.displayName = 'PasswordInput'
