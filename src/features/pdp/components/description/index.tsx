'use client'

import { memo } from 'react'

import dynamic from 'next/dynamic'

import { Content } from '@prismicio/client'
import { PrismicRichText } from '@prismicio/react'

import { useProductQuery } from '@/lib/queries/products'
import { Simplify } from '@/lib/types/prismic'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { BrandOrigin } from '../brand-origin'
import { CTA } from '../cta'
import { Heading } from '../heading'

const Accordions = dynamic(() => import('../accordions').then(({ Accordions }) => Accordions), {
  ssr: false,
})

interface DescriptionProps {
  cartUrl: string
  prismicData?: Simplify<Content.PdpDocumentData>
}

export const Description = memo(({ cartUrl, prismicData }: DescriptionProps) => {
  const { data: flightData, isError } = useProductQuery(cartUrl)
  const isDesktop = useIsDesktop()

  if (isError) {
    return <>Error</>
  }

  return (
    <div>
      <Heading />
      {isDesktop && <CTA cartUrl={cartUrl} />}
      <BrandOrigin cartUrl={cartUrl} />
      <div className="py-4 [&>p]:my-4">
        <PrismicRichText field={prismicData?.summary} />
      </div>
      {/* {
      prismicData?.body !== undefined && prismicData.body.length > 0 ? ( */}
      <Accordions attributes={flightData?.attributes} data={prismicData?.body} />
      {/* ) : undefined
      } */}
    </div>
  )
})

Description.displayName = 'Description'
