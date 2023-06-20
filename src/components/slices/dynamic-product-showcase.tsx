import { CSSProperties, useMemo } from 'react'

import { Carousel } from '@mantine/carousel'
import { Skeleton } from '@mantine/core'
import type { Content } from '@prismicio/client'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

import { useProductsQuery } from '@/lib/queries/products'

import { ProductCard } from '../product-card'

type DynamicProductShowcaseProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyDynamicProductShowcaseSlice>

export const DynamicProductShowcase = ({
  excludedSku = '',
  slice,
}: DynamicProductShowcaseProps & { excludedSku?: string }) => {
  const { data: allProducts, isFetching, isLoading } = useProductsQuery()

  const products = useMemo(
    () =>
      allProducts?.filter(
        product => product.attributes?.Brand === slice.primary.brand && product.sku !== excludedSku
      ),
    [allProducts, excludedSku, slice.primary.brand]
  )

  if (isFetching || isLoading) {
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
        className="px-4 lg:text-center"
        style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
      >
        <PrismicRichText field={slice.primary.heading} />
      </div>
      <Carousel withControls withIndicators align="start" slideGap="lg" slideSize="25%">
        {products.map(product => (
          <Carousel.Slide key={product.sku} className="py-8">
            <ProductCard className="h-full" product={product} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  )
}
