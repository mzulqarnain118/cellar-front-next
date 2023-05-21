'use client'
import { useCallback } from 'react'

import { useRouter } from 'next/router'

import { asLink, asText } from '@prismicio/helpers'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, PrismicText } from '@prismicio/react'

import { DynamicProductShowcase } from '@/components/slices/dynamic-product-showcase'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useBrand } from '@/lib/hooks/use-brand'
import { useProductQuery } from '@/lib/queries/products'

interface BrandProps {
  cartUrl: string
  className: string
}

export const Brand = ({ cartUrl, className }: BrandProps) => {
  const { data: product } = useProductQuery(cartUrl)
  const { brandLandingData, imageAndTextData, productShowcaseData } = useBrand(
    product?.attributes?.Brand?.toLowerCase()
  )
  const router = useRouter()

  const handleBrandButtonClick = useCallback(() => {
    if (
      brandLandingData !== undefined &&
      brandLandingData?.brand_link.link_type !== 'Any' &&
      'url' in brandLandingData.brand_link
    ) {
      router.push(`/brands${asLink(brandLandingData.brand_link)}`)
    }
  }, [brandLandingData, router])

  return (
    <div className={className}>
      <div className="py-10">
        <Typography as="h2" className="text-center">
          You may also like
        </Typography>
        {productShowcaseData?.[0] !== undefined ? (
          // @ts-ignore
          <DynamicProductShowcase excludedSku={product?.sku} slice={productShowcaseData[0]} />
        ) : undefined}
      </div>
      <div className="flex items-center gap-10">
        <div>
          <Typography className="font-heading text-xl italic">About</Typography>
          <div className="h3 !font-body capitalize leading-none">
            <PrismicText field={brandLandingData?.brand} />
          </div>
          <div className="py-4 [&>p]:mb-4">
            <PrismicRichText field={imageAndTextData?.[0]?.primary.content} />
          </div>
          <Button dark fullWidth onClick={handleBrandButtonClick}>
            Go to {asText(brandLandingData?.brand)}
          </Button>
        </div>
        <PrismicNextImage field={imageAndTextData?.[0]?.primary.image} />
      </div>
    </div>
  )
}
