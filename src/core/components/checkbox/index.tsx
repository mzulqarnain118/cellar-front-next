import { forwardRef } from 'react'

import { CheckboxProps, Checkbox as MantineCheckbox } from '@mantine/core'
import { FieldValues, UseFormRegister } from 'react-hook-form'

interface Props<TFIeldValues extends FieldValues = FieldValues> extends CheckboxProps {
  register?: UseFormRegister<TFIeldValues>
}

export const Checkbox = forwardRef<HTMLInputElement, Props>(({ register, ...props }, ref) => (
  <MantineCheckbox ref={ref} {...register} {...props} />
))

Checkbox.displayName = 'Checkbox'
