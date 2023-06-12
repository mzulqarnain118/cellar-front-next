import { Content, RichTextField, TitleField, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText } from '@prismicio/react'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

import { Simplify } from 'prismicio-types'

interface GrowerDetailTerroirProps {
  data: {
    empty: boolean
    firstDescription: RichTextField
    grower?: Simplify<Content.GrowerDetailsDocumentDataGrowerImagesItem>
    highlight: RichTextField
    secondDescription: RichTextField
    title: TitleField
  }
}

export const GrowerDetailTerroir = ({ data }: GrowerDetailTerroirProps) => (
  <div>
    <div className="w-4/5 max-w-7xl text-neutral-dark m-auto">
      <div className="mt-6 grid grid-cols-12">
        <div
          className={clsx('text-lg leading-[48px] p-4', data.grower ? 'col-span-7' : 'col-span-12')}
        >
          <PrismicRichText field={data.firstDescription} />
        </div>
        {data.grower && (
          <div className="col-span-5">
            <PrismicNextImage field={data.grower['grower-image']} />
          </div>
        )}
      </div>
      {!!data.secondDescription && (
        <div className="mt-6 flex text-lg leading-[48px]">
          <PrismicRichText field={data.secondDescription} />
        </div>
      )}
      <div className="mt-16 text-center">
        <div className="py-4">
          <Typography as="h5">{asText(data.title)}</Typography>
        </div>
        <hr className="mx-auto my-4 w-[250px] border border-t-4 border-[#c07d64]" />{' '}
        <div className="text-xl my-8 leading-[220%]">
          <PrismicRichText field={data.highlight} />
        </div>
        <hr className="mx-auto my-4 w-[250px] border border-t-4 border-[#c07d64]" />{' '}
      </div>
      {!data.empty && (
        <div className="caption">
          <h5>Products</h5>
        </div>
      )}
    </div>
  </div>
)
