import { asText } from '@prismicio/helpers'
import { SliceZone } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'
import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'

import { components } from '@/components/slices'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'
import { useEffect } from 'react'

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps = async ({
  params,
  previewData,
}: GetStaticPropsContext<{ uid: string }>) => {
  const client = createClient({ previewData })
  const uid = params?.uid?.toString()
  let page

  if (uid === undefined) {
    return {
      redirect: {
        destination: HOME_PAGE_PATH,
        permanent: false,
      },
    }
  }

  if (uid !== undefined) {
    page = await client.getByUID('rich_content_page', uid)
  }

  if (page === undefined) {
    return {
      redirect: {
        destination: HOME_PAGE_PATH,
        permanent: false,
      },
    }
  }

  const queryClient = await getStaticNavigation(client)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const pages = await client.getAllByType('rich_content_page')
  const paths = pages
    .filter(page => page.data.page_type === 'Brand Detail')
    .map(page => `/brands/${page.uid}`)

  return {
    fallback: true,
    paths,
  }
}

const BrandPage = ({ page }: PageProps) => {

  useEffect(() => {
    const client = createClient()
    const pages = async () => {
      return await client.getAllByType('rich_content_page')
    }
  }, [])

  return <>
    <NextSeo
      description={asText(page?.data.meta_description) || undefined}
      title={asText(page?.data.meta_title) || undefined}
    />
    <main>
      <SliceZone components={components} slices={page?.data.body} />
    </main>
  </>
}

export default BrandPage
