import { FieldValues, UseControllerProps } from 'react-hook-form'

export interface DateOfBirthProps<T extends FieldValues> extends UseControllerProps<T> {
  setFocus: (name: keyof T) => void
}
