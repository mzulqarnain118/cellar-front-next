import Image from 'next/image'
import { useRouter } from 'next/router'

import { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicText } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { Breadcrumbs } from 'react-daisyui'

import { Link } from '@/components/link'
import { Typography } from '@/core/components/typogrpahy'
import { HOME_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { PRODUCTS_QUERY_KEY, getProductByCartUrl, useProductQuery } from '@/lib/queries/products'
import { createClient } from '@/prismic-io'

export const getStaticProps = async ({ params, previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const cartUrl = params?.url || ''

  // ! TODO: Convert Prismic PDP UID from SKU to Cart URL.
  const [queryClient, pdps] = await Promise.all([
    getStaticNavigation(client),
    client.getAllByType<Content.PdpDocument>('pdp'),
  ])
  const page = pdps.find(pdp => asText(pdp.data.url) === cartUrl.toString()) || null
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
  const router = useRouter()
  const { url } = router.query
  const { data: product } = useProductQuery(url?.toString() || '')

  return (
    <>
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
        <div className="grid lg:grid-cols-2">
          <Image
            alt={product?.displayName || ''}
            height={526}
            src={product?.pictureUrl || ''}
            width={360}
          />
          <Typography>
            <Typography as="h1">{product?.displayName}</Typography>
            <PrismicText field={page?.data.summary} />
          </Typography>
        </div>
      </div>
    </>
  )
}

export default PDP
