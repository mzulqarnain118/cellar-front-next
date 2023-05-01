import { ComponentPropsWithoutRef, ElementType, JSXElementConstructor, ReactNode } from 'react'

import { clsx } from 'clsx'

type PropsOf<C extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>> =
  JSX.LibraryManagedAttributes<C, ComponentPropsWithoutRef<C>>

type AsProp<C extends ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: C
}

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
type ExtendableProps<
  ExtendedProps = Record<string, unknown>,
  OverrideProps = Record<string, unknown>
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
type InheritableElementProps<
  C extends ElementType,
  Props = Record<string, unknown>
> = ExtendableProps<PropsOf<C>, Props>

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
type PolymorphicComponentProps<
  C extends ElementType,
  Props = Record<string, unknown>
> = InheritableElementProps<C, Props & AsProp<C>>

interface Props {
  displayAs?: string
  children: ReactNode
  wrapperClassName?: string
}

type TypographyProps<T extends ElementType> = PolymorphicComponentProps<T, Props>

export const Typography = <T extends ElementType = 'span'>({
  as,
  children,
  className,
  displayAs,
  wrapperClassName,
  ...rest
}: TypographyProps<T>) => {
  const Component = as || 'span'

  return (
    <div
      className={clsx(
        'prose-lg prose max-w-none prose-headings:font-heading prose-headings:leading-[inherit]',
        wrapperClassName
      )}
    >
      <Component
        {...rest}
        className={
          displayAs !== undefined || className !== undefined
            ? clsx(displayAs, className)
            : undefined
        }
      >
        {children}
      </Component>
    </div>
  )
}
