import { DefaultMantineColor, Tuple } from '@mantine/core'

type ExtendedCustomColors =
  | 'accent'
  | 'brand'
  | 'error'
  | 'ghost'
  | 'info'
  | 'neutral'
  | 'product'
  | 'success'
  | DefaultMantineColor

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>
  }

  export interface ButtonProps<T> extends DefaultProps<ButtonStylesNames, ButtonStylesParams> {
    /** Predefined button size */
    size?: MantineSize
    /** Button type attribute */
    type?: 'submit' | 'button' | 'reset'
    /** Button color from theme */
    color?: MantineColor
    /** Adds icon before button label  */
    leftIcon?: React.ReactNode
    /** Adds icon after button label  */
    rightIcon?: React.ReactNode
    /** Sets button width to 100% of parent element */
    fullWidth?: boolean
    /** Key of theme.radius or any valid CSS value to set border-radius, theme.defaultRadius by default */
    radius?: MantineNumberSize
    /** Controls button appearance */
    variant?: Variants<'filled' | 'outline' | 'light' | 'white' | 'default' | 'subtle' | 'gradient'>
    /** Controls gradient settings in gradient variant only */
    gradient?: MantineGradient
    /** Set text-transform to uppercase */
    uppercase?: boolean
    /** Reduces vertical and horizontal spacing */
    compact?: boolean
    /** Indicate loading state */
    loading?: boolean
    /** Props spread to Loader component */
    loaderProps?: LoaderProps
    /** Loader position relative to button label */
    loaderPosition?: 'left' | 'right' | 'center'
    /** Button label */
    children?: React.ReactNode
    /** Disabled state */
    disabled?: boolean
    component?: React.ElementType<T>
  }

  export interface NavLinkProps<T>
    extends DefaultProps<NavLinkStylesNames, NavLinkStylesParams>,
      T {
    /** Main link content */
    label?: React.ReactNode
    /** Secondary link description */
    description?: React.ReactNode
    /** Icon displayed on the left side of the label */
    icon?: React.ReactNode
    /** Section displayed on the right side of the label */
    rightSection?: React.ReactNode
    /** Determines whether link should have active styles */
    active?: boolean
    /** Key of theme.colors, active link color */
    color?: MantineColor
    /** Active link variant */
    variant?: Variants<'filled' | 'light' | 'subtle'>
    /** If prop is set then label and description will not wrap on the next line */
    noWrap?: boolean
    /** Child links */
    children?: React.ReactNode
    /** Controlled nested items collapse state */
    opened?: boolean
    /** Uncontrolled nested items collapse initial state */
    defaultOpened?: boolean
    /** Called when open state changes */
    onChange?(opened: boolean): void
    /** If set to true, right section will not rotate when collapse is opened */
    disableRightSectionRotation?: boolean
    /** Key of theme.spacing or any valid CSS value to set collapsed links padding-left */
    childrenOffset?: MantineNumberSize
    /** Adds disabled styles to root element */
    disabled?: boolean
    component?: React.ElementType<T>
  }

  export interface MenuItemProps<T> extends DefaultProps {
    /** Item label */
    children?: React.ReactNode
    /** Key of theme.colors */
    color?: MantineColor
    /** Determines whether menu should be closed when item is clicked, overrides closeOnItemClick prop on Menu component */
    closeMenuOnClick?: boolean
    /** Icon rendered on the left side of the label */
    icon?: React.ReactNode
    /** Section rendered on the right side of the label */
    rightSection?: React.ReactNode
    component?: React.ElementType<T>
  }
}
