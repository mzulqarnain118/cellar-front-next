import { ImageField, RichTextField, TitleField, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText } from '@prismicio/react'

import { Typography } from '@/core/components/typogrpahy'

interface BrandHeadingProps {
  data: {
    image: ImageField<never>
    subTitle: RichTextField
    title: TitleField
  }
}

export const BrandHeading = ({ data }: BrandHeadingProps) => (
  <div className="relative py-6 overflow-hidden">
    <div className="z-10 max-w-[800px] pl-[12%] mb-[120px]">
      <Typography as="h1">{asText(data.title)}</Typography>
      <hr className="w-[250px] inline-block border-t-4 border-solid border-[#c07d64]" />
      <PrismicRichText field={data.subTitle} />
    </div>
    <div className="absolute top-0 right-0 h-full z-0">
      <PrismicNextImage field={data.image} />
    </div>
  </div>
)
