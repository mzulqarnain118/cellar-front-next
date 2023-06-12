import { useMemo, useState } from 'react'

import { asLink } from '@prismicio/client'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { GrowerDetailFooter } from '@/features/growers/components/details/footer'
import { GrowerDetailHeading } from '@/features/growers/components/details/heading'
import { GrowerDetailHistory } from '@/features/growers/components/details/history'
import { GrowerDetailTerroir } from '@/features/growers/components/details/terroir'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'

export const getStaticProps = async ({
  params,
  previewData,
}: GetStaticPropsContext<{ detail: string }>) => {
  const client = createClient({ previewData })
  const uid = params?.detail?.toString()
  let page

  if (uid === undefined) {
    return {
      notFound: true,
    }
  }

  try {
    if (uid !== undefined) {
      page = await client.getByUID('grower-details', uid)
    }

    if (page === undefined) {
      return {
        notFound: true,
      }
    }
  } catch {
    return {
      notFound: true,
    }
  }

  const queryClient = await getStaticNavigation(client)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: page || null,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const pages = await client.getAllByType('grower-details')
  const paths = pages.map(page => asLink(page) || undefined, []).filter(Boolean)

  return {
    fallback: true,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const GrowerDetailPage: NextPage<PageProps> = ({ page }) => {
  const [empty, _setEmpty] = useState(true)

  const growerImages = useMemo(() => page?.data['grower-images'], [page?.data])

  const headingData = useMemo(
    () => ({
      backgroundHeaderImage: page?.data['background-header-image'],
      firstDescription: page?.data['grower-description'],
      grower: growerImages[0],
      name: page?.data['grower-name'],
      regionMap: page?.data.region_map,
      secondDescription: page?.data.grower_description_second,
      title: page?.data['grower-title'],
    }),
    [growerImages, page?.data]
  )

  const historyData = useMemo(
    () => ({
      firstDescription: page?.data.grower_description_first_secondary,
      grower: growerImages?.[1],
      highlight: page?.data['grower-description-highlight'],
      secondDescription: page?.data.grower_description_second_secondary,
    }),
    [growerImages, page?.data]
  )

  const terroirData = useMemo(
    () => ({
      empty,
      firstDescription: page?.data['grower-highlight'],
      grower: growerImages?.[2],
      highlight: page?.data['grower-terroir-highlight'],
      secondDescription: page?.data.grower_terroir_secondary,
      title: page?.data['terroir-header'],
    }),
    [empty, growerImages, page?.data]
  )

  const footerData = useMemo(
    () => ({
      image: page?.data.footer_image,
    }),
    [page?.data.footer_image]
  )

  return (
    <>
      <NextSeo description="" title="" />
      <main>
        <GrowerDetailHeading data={headingData} />
        <GrowerDetailHistory data={historyData} />
        <GrowerDetailTerroir data={terroirData} />
        {/* {growerProducts && growerProducts.length > 0 && (
          <ProductCarousel products={growerProducts} setProductsEmpty={setEmpty} />
        )} */}
        <GrowerDetailFooter data={footerData} />
      </main>
    </>
  )
}

export default GrowerDetailPage
