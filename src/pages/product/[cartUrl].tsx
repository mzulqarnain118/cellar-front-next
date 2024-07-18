import { useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'
import Error from 'next/error'
import { useRouter } from 'next/router'

import { Content, asLink, asText, filter } from '@prismicio/client'
import { asImageWidthSrcSet } from '@prismicio/helpers'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo, NextSeoProps } from 'next-seo'
import { useIsMounted } from 'usehooks-ts'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'
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
import { trackProductView } from '@/lib/utils/gtm-util'
import { createClient } from '@/prismic-io'

const Brand = dynamic(() => import('@/features/pdp/components/brand').then(({ Brand }) => Brand), {
  ssr: false,
})

const CtaActions = dynamic(() =>
  import('@/features/pdp/components/cta/actions').then(({ CtaActions }) => CtaActions)
)

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

  try {
    await queryClient.prefetchQuery([...PRODUCTS_QUERY_KEY, cartUrl], getProductByCartUrl)
    const pdps = await client.getAllByType<Content.PdpDocument>('pdp', {
      filters: [filter.fulltext('my.pdp.url', cartUrl.toString())],
      graphQuery,
    })
    const pdpData = pdps[0].data
    const page = pdps.find(pdp => asLink(pdp) === cartUrl || pdp?.slugs?.[0] === cartUrl) || null
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        page: page || null,
        pdpData,
      },
      revalidate: 120,
    }
  } catch {
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        page: null,
      },
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const queryClient = new QueryClient()
  const products = await queryClient.ensureQueryData([PRODUCTS_QUERY_KEY], getAllProducts)
  const paths =
    products !== null ? products?.map(pdp => ({ params: { cartUrl: pdp.cartUrl } })) : []

  return {
    fallback: false,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const PDP: NextPage<PageProps> = ({ page, pdpData }) => {
  const router = useRouter()
  const isMounted = useIsMounted()
  const { cartUrl } = router.query
  const { data: product } = useProductQuery(cartUrl?.toString() || '')
  const { setSelectedProduct } = usePdpActions()
  const isDesktop = useIsDesktop()

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

  const seoProps: Partial<NextSeoProps> = useMemo(
    () => ({
      description: `${asText(page?.data.summary)?.substring(0, 161)}`,
      openGraph: {
        images: images.map(image => ({ alt: image.alt, url: image.src })),
      },
      title: product?.displayName,
    }),
    [images, page?.data.summary, product?.displayName]
  )

  useEffect(() => {
    if (product !== null && product !== undefined) {
      // Track Product view on Page Load
      trackProductView(product)
      setSelectedProduct(product)
    }
  }, [product, setSelectedProduct])

  if (cartUrl === undefined || cartUrl === 'undefined' || typeof cartUrl !== 'string') {
    return <Error statusCode={404} />
  }

  return (
    <>
      <NextSeo {...seoProps} />
      <main className="bg-[#f7f3f4]">
        <div className="container mx-auto py-10">
          <Breadcrumbs cartUrl={cartUrl} />
          <div className={`grid gap-10 lg:grid-cols-2 carousal-arrows`}>
            <MediaGallery
              badges={product?.badges?.slice(0, 3)}
              className="self-start"
              images={images}
              videos={pdpData?.videos}
            />
            <Description cartUrl={cartUrl} prismicData={pdpData} />
          </div>
          <Brand cartUrl={cartUrl} className="py-4" />
        </div>
        {isDesktop ? undefined : isMounted() ? (
          <CtaActions
            className={`
              fixed z-10 bottom-0 left-0 w-full bg-neutral-50 p-4 border-t border-neutral-light
              shadow
            `}
          />
        ) : undefined}
      </main>
    </>
  )
}

export default PDP
