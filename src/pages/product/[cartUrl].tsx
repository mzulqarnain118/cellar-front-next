import { useMemo } from 'react'

import dynamic from 'next/dynamic'
import Error from 'next/error'
import { useRouter } from 'next/router'

import { asImageWidthSrcSet } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { Breadcrumbs } from '@/features/pdp/components/breadcrumbs'
import { Description } from '@/features/pdp/components/description'
import { MediaGallery } from '@/features/pdp/components/media-gallery'
import { getStaticNavigation } from '@/lib/queries/header'
import { PRODUCTS_QUERY_KEY, getProductByCartUrl, useProductQuery } from '@/lib/queries/products'
import { createClient } from '@/prismic-io'

const Brand = dynamic(() => import('@/features/pdp/components/brand').then(({ Brand }) => Brand), {
  ssr: false,
})

const graphQuery = `{
  pdp {
    body {
      ...on accordion {
        non-repeat {
          ...non-repeatFields
        }
        repeat {
          ...repeatFields
        }
      }
    }
    images
    summary
    tasting_video
    url
    videos
  }
}`

export const getStaticProps = async ({ params, previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const cartUrl = params?.cartUrl || ''

  // ! TODO: Convert Prismic PDP UID from SKU to Cart URL.
  const queryClient = await getStaticNavigation(client)
  const page = await client.getByUID('pdp', cartUrl.toString(), { graphQuery })
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
  const paths = pdps.map(pdp => ({ params: { cartUrl: pdp.uid } }))

  return {
    fallback: false,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const PDP: NextPage<PageProps> = ({ page }) => {
  const router = useRouter()
  const { cartUrl } = router.query
  const { data: product } = useProductQuery(cartUrl?.toString() || '')

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

  if (cartUrl === undefined || typeof cartUrl !== 'string') {
    return <Error statusCode={404} />
  }

  return (
    <>
      <NextSeo />
      <main className="bg-[#f7f3f4]">
        <div className="container mx-auto py-10">
          <Breadcrumbs cartUrl={cartUrl} />
          <div className="grid gap-10 lg:grid-cols-2">
            <MediaGallery className="self-start" images={images} videos={page?.data.videos} />
            <Description cartUrl={cartUrl} prismicData={page?.data} />
          </div>
          <Brand cartUrl={cartUrl} className="py-4" />
        </div>
      </main>
    </>
  )
}

export default PDP
