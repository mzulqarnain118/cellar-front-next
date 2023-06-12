import { Content, ImageField, RichTextField, TitleField, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText } from '@prismicio/react'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

import { Simplify } from 'prismicio-types'

interface GrowerDetailHeadingProps {
  data: {
    backgroundHeaderImage: ImageField<never>
    firstDescription: RichTextField
    grower?: Simplify<Content.GrowerDetailsDocumentDataGrowerImagesItem>
    name: RichTextField
    regionMap: ImageField
    secondDescription: RichTextField
    title: TitleField
  }
}

export const GrowerDetailHeading = ({ data }: GrowerDetailHeadingProps) => (
  <div>
    <div className="w-full relative">
      <PrismicNextImage className="w-full" field={data.backgroundHeaderImage} />
      <div className="z-10 absolute right-[5%] bottom-0 translate-y-1/2">
        <PrismicNextImage className="max-w-[25vw]" field={data.regionMap} />
      </div>
    </div>
    <div className="w-4/5 max-w-7xl text-neutral-dark m-auto">
      <div className="w-11/12">
        <Typography as="h1" className="border-neutral-dark border-b-4 pb-4 mt-8">
          {asText(data.name)}, {asText(data.title)}
        </Typography>
      </div>
      <div className="mt-6 grid grid-cols-12">
        <div className={clsx('leading-[48px]', data.grower ? 'col-span-7' : 'col-span-12')}>
          <PrismicRichText field={data.firstDescription} />
        </div>
        {data.grower && (
          <div className="col-span-5">
            <PrismicNextImage field={data.grower['grower-image']} />
          </div>
        )}
      </div>
      <div className="mt-6 flex leading-[48px]">
        <PrismicRichText field={data.secondDescription} />
      </div>
    </div>
  </div>
)
