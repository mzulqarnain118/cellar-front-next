import { RichTextField, TitleField, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText } from '@prismicio/react'
import { ImageField } from '@prismicio/types'

import { Typography } from '@/core/components/typogrpahy'

interface GrowerHeadingProps {
  data: {
    alt: RichTextField
    backgroundImage: ImageField<never>
    subTitle: RichTextField
    title: TitleField
  }
}

export const GrowerHeading = ({ data }: GrowerHeadingProps) => (
  <div className="relative">
    <div className="w-full h-[50.75rem]">
      <PrismicNextImage fill className="object-cover" fallbackAlt="" field={data.backgroundImage} />
    </div>
    <div className="absolute top-1/2 w-full text-neutral-50 flex justify-center -translate-y-1/2">
      <div className="text-center w-4/5 max-w-7xl">
        <Typography as="h1" className="mt-10 mb-14">
          {asText(data.title)}
        </Typography>
        <div className="text-xl">
          <PrismicRichText field={data.subTitle} />
        </div>
      </div>
    </div>
  </div>
)
