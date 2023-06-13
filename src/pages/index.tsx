import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { SliceZone } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { components } from '@/components/slices'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })

  try {
    const [queryClient, page] = await Promise.all([
      getStaticNavigation(client),
      client.getByUID<Content.RichContentPageDocument>('rich_content_page', 'home'),
    ])

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        page,
      },
      revalidate: 120,
    }
  } catch {
    return {
      props: {
        page: null,
      },
    }
  }
}

const HomePage: NextPage<PageProps> = ({ page }: PageProps) => (
  <>
    <NextSeo
      description={asText(page?.data.meta_description) || undefined}
      title={asText(page?.data.meta_title) || undefined}
    />
    <main>
      <SliceZone components={components} slices={page?.data.body} />
    </main>
  </>
)

export default HomePage
