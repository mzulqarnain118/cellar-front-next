'use client'

import { memo } from 'react'

import dynamic from 'next/dynamic'

import { Content } from '@prismicio/client'
import { PrismicRichText } from '@prismicio/react'

import { Typography } from '@/core/components/typogrpahy'
import { useProductQuery } from '@/lib/queries/products'
import { Simplify } from '@/lib/types/prismic'

import { CTA } from '../cta'
import { Heading } from '../heading'

const Accordions = dynamic(() => import('../accordions').then(({ Accordions }) => Accordions), {
  ssr: false,
})

interface DescriptionProps {
  cartUrl: string
  prismicData: Simplify<Content.PdpDocumentData>
}

export const Description = memo(({ cartUrl, prismicData }: DescriptionProps) => {
  const { data: flightData, isError } = useProductQuery(cartUrl)

  if (isError) {
    return <>Error</>
  }

  return (
    <div>
      <Heading cartUrl={cartUrl} />
      <CTA cartUrl={cartUrl} />
      <div className="flex items-center justify-between">
        <Typography>{flightData?.attributes?.Brand}</Typography>
        <Typography>{flightData?.attributes?.Origin}</Typography>
      </div>
      <div className="py-4 [&>p]:my-4">
        <PrismicRichText field={prismicData.summary} />
      </div>
      {prismicData.body.length > 0 ? (
        <Accordions attributes={flightData?.attributes} cartUrl={cartUrl} data={prismicData.body} />
      ) : undefined}
    </div>
  )
})

Description.displayName = 'Description'
