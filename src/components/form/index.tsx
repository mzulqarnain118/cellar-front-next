import { Children, ReactNode, createElement, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { DeepPartial, FieldValues, UseFormProps, useForm } from 'react-hook-form'
import { ZodOptional, ZodType } from 'zod'

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  children: ReactNode
  className?: string
  defaultValues: DeepPartial<TFieldValues>
  id?: string
  onSubmit: (data: TFieldValues) => void
  schema: ZodType<TFieldValues>
}

export const Form = <TFieldValues extends FieldValues = FieldValues>({
  defaultValues,
  children,
  className,
  id,
  onSubmit,
  schema,
}: FormProps<TFieldValues>) => {
  const props: UseFormProps<TFieldValues> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(schema),
    }),
    [defaultValues, schema]
  )
  const methods = useForm<TFieldValues>(props)
  const { handleSubmit } = methods

  return (
    <form className={className} id={id} onSubmit={handleSubmit(onSubmit)}>
      {Children.map(children, child =>
        !!child &&
        typeof child !== 'string' &&
        typeof child !== 'number' &&
        typeof child !== 'boolean' &&
        'props' in child &&
        child?.props.name
          ? createElement(child.type, {
              ...{
                ...child.props,
                control: methods.control,
                defaultValue: defaultValues[child.props.name] || '',
                dirty: methods.formState.dirtyFields[child.props.name],
                error: methods.formState.errors[child.props.name]?.message || child.props.error,
                key: child.props.name,
                register: methods.register(child.props.name, {
                  onBlur: child.props.onBlur,
                  onChange: child.props.onChange,
                }),
                // @ts-ignore
                required: !(schema.shape?.[child.props.name] instanceof ZodOptional),
                touched: methods.formState.touchedFields[child.props.name],
              },
            })
          : child
      )}
    </form>
  )
}
