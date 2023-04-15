import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { SliceZone } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'

import { components } from '@/components/slices'
import { getStaticNavigation } from '@/lib/queries/header'

import { createClient } from 'prismic-io'

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const [queryClient, page] = await Promise.all([
    getStaticNavigation(client),
    client.getByUID<Content.RichContentPageDocument>('rich_content_page', 'home'),
  ])

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page,
    },
  }
}

const HomePage: NextPage<PageProps> = ({ page }: PageProps) => (
  <>
    <NextSeo
      description={asText(page?.data.meta_description)}
      title={asText(page?.data.meta_title)}
    />
    <SliceZone components={components} slices={page?.data.body} />
  </>
)

export default HomePage
