import { useMemo } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Content } from '@prismicio/client'
import { asImageWidthSrcSet } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Breadcrumbs } from 'react-daisyui'

import { Link } from '@/components/link'
import { Price } from '@/components/price'
import { Typography } from '@/core/components/typogrpahy'
import { HOME_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { PRODUCTS_QUERY_KEY, getProductByCartUrl, useProductQuery } from '@/lib/queries/products'
import { createClient } from '@/prismic-io'

const MediaGallery = dynamic(
  () => import('@/features/pdp/media-gallery').then(({ MediaGallery }) => MediaGallery),
  { ssr: false }
)

export const getStaticProps = async ({ params, previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const cartUrl = params?.url || ''

  // ! TODO: Convert Prismic PDP UID from SKU to Cart URL.
  const queryClient = await getStaticNavigation(client)
  const page = await client.getByUID<Content.PdpDocument>('pdp', cartUrl.toString())
  await queryClient.prefetchQuery([...PRODUCTS_QUERY_KEY, cartUrl], getProductByCartUrl)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page,
    },
    revalidate: 120,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const pdps = await client.getAllByType('pdp')
  const paths = pdps.map(pdp => ({ params: { url: pdp.uid } }))

  return {
    fallback: false,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const PDP: NextPage<PageProps> = ({ page }) => {
  // console.log(page)
  const router = useRouter()
  const { url } = router.query
  const { data: product } = useProductQuery(url?.toString() || '')

  const images = useMemo(
    () => [
      {
        alt: product?.displayName || 'Product image',
        src: product?.pictureUrl || '',
      },
      ...(page?.data.images
        .map(({ image }) => {
          const widthSrcSet = asImageWidthSrcSet(image)
          const src = widthSrcSet?.src || ''
          const srcSet = widthSrcSet?.srcset || ''

          return {
            alt: image.alt || product?.displayName || 'Product image',
            dimensions: image.dimensions || undefined,
            src,
            srcset: srcSet,
          }
        })
        .filter(image => image.src.length > 0) || []),
    ],
    [page?.data.images, product?.displayName, product?.pictureUrl]
  )

  return (
    <div className="bg-[#f7f3f4]">
      <NextSeo />
      <div className="container mx-auto">
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href={HOME_PAGE_PATH}>Home</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            <Link href={WINE_PAGE_PATH}>Wine</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>{product?.displayName}</Breadcrumbs.Item>
        </Breadcrumbs>
        <div className="grid gap-10 lg:grid-cols-2">
          <MediaGallery images={images} videos={page?.data.videos} />
          <div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Typography as="h1" displayAs="h4">
                  {product?.displayName}
                </Typography>
                <Typography as="p">
                  {product?.attributes?.SubType} - {product?.attributes?.Varietal} -{' '}
                  {product?.attributes?.['Container Size']}
                </Typography>
              </div>
              {product?.price !== undefined ? (
                <Price
                  className="!text-3xl"
                  price={product?.price}
                  onSalePrice={product?.onSalePrice}
                />
              ) : undefined}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDP
