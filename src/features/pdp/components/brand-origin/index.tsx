import { useCallback } from 'react'

import { useRouter } from 'next/router'

import { asLink } from '@prismicio/helpers'
import { PrismicNextImage } from '@prismicio/next'

import { Typography } from '@/core/components/typogrpahy'
import { useBrand } from '@/lib/hooks/use-brand'
import { useProductQuery } from '@/lib/queries/products'

interface BrandOriginProps {
  cartUrl: string
}

export const BrandOrigin = ({ cartUrl }: BrandOriginProps) => {
  const { data: product } = useProductQuery(cartUrl)
  const { brandLandingData } = useBrand(
    product?.attributes?.Brand?.split(' ').join('-').toLowerCase()
  )
  const router = useRouter()

  const handleBrandClick = useCallback(() => {
    if (
      brandLandingData !== undefined &&
      brandLandingData?.brand_link.link_type !== 'Any' &&
      'url' in brandLandingData.brand_link
    ) {
      router.push(`/brands${asLink(brandLandingData.brand_link)}`)
    }
  }, [brandLandingData, router])

  return (
    <div className="flex items-center justify-between">
      <PrismicNextImage
        aria-label="View brand page"
        className="cursor-pointer"
        field={brandLandingData?.brand_image}
        height={116}
        role="button"
        width={116}
        onClick={handleBrandClick}
      />
      <Typography>{product?.attributes?.Origin}</Typography>
    </div>
  )
}
