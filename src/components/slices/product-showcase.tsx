import { CSSProperties, useMemo } from 'react'

import { Skeleton } from '@mantine/core'
import type { Content } from '@prismicio/client'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

import { ProductCard } from '../product-card'

type ProductShowcaseProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyProductShowcaseSlice>

export const ProductShowcase = ({
  excludedSku = '',
  slice,
}: ProductShowcaseProps & { excludedSku?: string }) => {
  const products = useMemo(
    () =>
      slice.items
        .filter(product => !!product.image?.url)
        ?.map(item => ({
          displayName: item?.title?.[0]?.text ?? '',
          price: item?.price?.[0]?.text ?? '',
          pictureUrl: item?.image?.url ?? '',
          ctaLink: item?.cta_link?.[0]?.text ?? '',
          ctaText: item?.cta_text?.[0]?.text ?? '',
        })),
    [slice?.items]
  )

  if (!products) {
    return (
      <div className="flex w-full gap-8">
        <Skeleton className="my-8 h-[640px] !w-1/4" />
        <Skeleton className="my-8 h-[640px] !w-1/4" />
        <Skeleton className="my-8 h-[640px] !w-1/4" />
        <Skeleton className="my-8 h-[640px] !w-1/4" />
      </div>
    )
  }
  if (products === undefined || products.length === 0) {
    return <></>
  }

  return (
    <div className="py-8 lg:mx-auto container">
      <div
        className="px-4 text-center"
        style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
      >
        <PrismicRichText field={slice.primary.heading} />
      </div>
      {/* <Carousel withControls withIndicators align="start" slideGap="lg" slideSize="25%"> */}
      <div className="flex flex-wrap gap-16 justify-center py-8">
        {products?.map(product => (
          <div key={product.sku}>
            <ProductCard
              className="h-[500px] !w-[350px] bg-white"
              prismicColor={slice.primary.highlight_color}
              product={product}
            />
          </div>
        ))}
      </div>
      {/* </Carousel> */}
    </div>
  )
}
