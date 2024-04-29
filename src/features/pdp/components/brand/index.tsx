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
import { useProductQuery, useProductsQuery } from '@/lib/queries/products'

interface BrandProps {
  cartUrl: string
  className: string
}

export const Brand = ({ cartUrl, className }: BrandProps) => {
  const { data: product } = useProductQuery(cartUrl)
  const { data: allProducts, isFetchingProducts, isLoadingProducts } = useProductsQuery()

  const { brandLandingData, imageAndTextData, productShowcaseData } = useBrand(
    product?.attributes?.Brand?.split(' ').join('-').toLowerCase()
  )

  const slice = productShowcaseData && productShowcaseData[0]

  const sameBrandProducts = allProducts?.filter(
    currentProduct =>
      currentProduct.sku !== product?.sku &&
      currentProduct?.attributes?.Brand === slice?.primary.brand
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

  if (
    brandLandingData === undefined ||
    imageAndTextData === undefined ||
    productShowcaseData === undefined
  ) {
    return <></>
  }

  return (
    <div className={className}>
      {slice !== undefined && sameBrandProducts && sameBrandProducts.length > 0 ? (
        // @ts-ignore
        <div className="py-10">
          <Typography as="h2" className="text-center">
            You may also like
          </Typography>
          <DynamicProductShowcase
            allProducts={allProducts}
            excludedSku={product?.sku}
            isFetching={isFetchingProducts}
            isLoading={isLoadingProducts}
            slice={slice}
          />
        </div>
      ) : undefined}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center">
        <div className="min-[768]:max-w-[336px] min-[1024]:max-w-[459px] min-[1280]:max-w-[595px] min-[1400px]:max-w-[665px] basis-1/2 px-[15px]">
          <Typography className="font-heading text-xl italic">About</Typography>
          <div className="h3 !font-body capitalize leading-none">
            <PrismicText field={brandLandingData?.brand} />
          </div>
          <div className="py-4 [&>p]:mb-4 text-[#666162]">
            <PrismicRichText field={imageAndTextData?.[0]?.primary.content} />
          </div>
          <Button dark fullWidth onClick={handleBrandButtonClick}>
            Go to {asText(brandLandingData?.brand)}
          </Button>
        </div>
        <div className="basis-1/2 px-[15px] grid place-items-center">
          <PrismicNextImage field={imageAndTextData?.[0]?.primary.image} />
        </div>
      </div>
    </div>
  )
}
