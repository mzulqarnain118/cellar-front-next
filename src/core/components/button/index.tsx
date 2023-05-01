import { forwardRef } from 'react'

import { useReducedMotion } from '@mantine/hooks'
import { clsx } from 'clsx'
import { ButtonProps, Button as DaisyButton } from 'react-daisyui'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <DaisyButton
      {...props}
      ref={ref}
      animation={!prefersReducedMotion}
      className={clsx('rounded', props.className, 'normal-case')}
      color={props.color || 'primary'}
    />
  )
})

Button.displayName = 'Button'
