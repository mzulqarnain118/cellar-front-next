import { useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'
import Error from 'next/error'
import { useRouter } from 'next/router'

import { Content, asText, filter } from '@prismicio/client'
import { asImageWidthSrcSet } from '@prismicio/helpers'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { Breadcrumbs } from '@/features/pdp/components/breadcrumbs'
import { Description } from '@/features/pdp/components/description'
import { MediaGallery } from '@/features/pdp/components/media-gallery'
import { usePdpActions } from '@/features/pdp/store'
import { getStaticNavigation } from '@/lib/queries/header'
import {
  PRODUCTS_QUERY_KEY,
  getAllProducts,
  getProductByCartUrl,
  useProductQuery,
} from '@/lib/queries/products'
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

  const queryClient = await getStaticNavigation(client)
  const pdps = await client.getAllByType<Content.PdpDocument>('pdp', {
    filters: [filter.fulltext('my.pdp.url', cartUrl.toString())],
    graphQuery,
  })
  const page = pdps.find(pdp => asText(pdp.data.url) === cartUrl) || null
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
  const queryClient = new QueryClient()
  const products = await queryClient.ensureQueryData([PRODUCTS_QUERY_KEY], getAllProducts)
  const paths =
    products !== undefined ? products?.map(pdp => ({ params: { cartUrl: pdp.cartUrl } })) : []

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
  const { setSelectedProduct } = usePdpActions()

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

  useEffect(() => {
    if (product !== undefined) {
      setSelectedProduct(product)
    }
  }, [product, setSelectedProduct])

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
