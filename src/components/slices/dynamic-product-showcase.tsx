import { CSSProperties, useMemo } from 'react'

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
  const brand = slice.primary.brand

  const productsSelectedInPrismic = useMemo(
    () => slice?.items?.map(product => product?.display_order?.uid?.toLowerCase() ?? ''),
    [slice?.items]
  )

  const products = useMemo(
    () =>
      allProducts
        ?.filter(product =>
          brand
            ? product.attributes?.Brand === brand
            : productsSelectedInPrismic.includes(product.sku)
        )
        ?.filter(product => product.sku != excludedSku),
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
        className="px-4 text-center"
        style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
      >
        <PrismicRichText field={slice.primary.heading} />
      </div>
      {/* <Carousel align="start" slideGap="lg" slideSize="25%"> */}
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
