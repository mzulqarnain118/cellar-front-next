import { forwardRef } from 'react'

import { SelectItemProps } from '@mantine/core'

import { Typography } from '@/core/components/typogrpahy'
import { ProductsSchema } from '@/lib/types/schemas/product'

type ItemProps = SelectItemProps & ProductsSchema

export const SearchItem = forwardRef((props: ItemProps, ref) => (
  <Typography ref={ref}>{props.displayName.toLowerCase()}</Typography>
))

SearchItem.displayName = 'SearchItem'
