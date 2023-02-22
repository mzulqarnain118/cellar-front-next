import type { Content } from '@prismicio/client'
import type { SliceComponentProps } from '@prismicio/react'

type DynamicProductShowcaseProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyColumnedContentSlice>

export const DynamicProductShowcase = ({ slice }: DynamicProductShowcaseProps) => {
  console.log('slice', slice)
  return <>Hi</>
}
