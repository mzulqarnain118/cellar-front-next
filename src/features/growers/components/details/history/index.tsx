import { Content, RichTextField } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText } from '@prismicio/react'
import { clsx } from 'clsx'

import { Simplify } from 'prismicio-types'

interface GrowerDetailHistoryProps {
  data: {
    firstDescription: RichTextField
    grower?: Simplify<Content.GrowerDetailsDocumentDataGrowerImagesItem>
    highlight: RichTextField
    secondDescription: RichTextField
  }
}

export const GrowerDetailHistory = ({ data }: GrowerDetailHistoryProps) => (
  <div>
    <div className="w-4/5 max-w-7xl text-neutral-dark m-auto">
      <div className="mt-20 mb-24 text-xl leading-[71px] text-center">
        <hr className="mx-auto w-[250px] border border-t-4 border-[#c07d64]" />
        <PrismicRichText field={data.highlight} />
        <hr className="w-[250px] mx-auto border border-t-4 border-[#c07d64]" />
      </div>
      <div className="mt-6 grid grid-cols-12">
        {data.grower && (
          <div className="col-span-5">
            <PrismicNextImage field={data.grower['grower-image']} />
          </div>
        )}
        <div
          className={clsx(
            'text-2xl leading-[220%] my-8',
            data.grower ? 'col-span-7' : 'col-span-12'
          )}
        >
          <PrismicRichText field={data.firstDescription} />
        </div>
      </div>
      {!!data.secondDescription && (
        <div className="flex mt-6 text-lg leading-[48px]">
          <PrismicRichText field={data.secondDescription} />
        </div>
      )}
    </div>
  </div>
)
