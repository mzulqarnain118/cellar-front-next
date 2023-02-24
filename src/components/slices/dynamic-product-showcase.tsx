import type { Content } from '@prismicio/client'
import type { SliceComponentProps } from '@prismicio/react'

type DynamicProductShowcaseProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyColumnedContentSlice>

export const DynamicProductShowcase = ({ slice: _slice }: DynamicProductShowcaseProps) => <>Hi</>
