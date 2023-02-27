import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { asLink } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'

import { WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'

import { createClient, linkResolver } from 'prismic-io'

export const getStaticProps = async ({ params, previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  let route
  if (params && params.category) {
    route = params.category.toString()
    if (typeof params.category === 'string') {
      route = params.category
    } else {
      route = `wine--${params.category.join('--')}`
    }
  }

  let page
  if (route !== undefined) {
    page = await client.getByUID('plp', route)
  }

  if (page === undefined) {
    return {
      permanent: false,
      redirect: WINE_PAGE_PATH,
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
  const pages = await client.getAllByType('plp')
  const paths = pages
    .filter(page => page.uid !== 'wine' && page.uid.startsWith('wine--'))
    .map(page => asLink(page, linkResolver) as string)
    .filter(Boolean)

  return {
    fallback: true,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const CategoryPage: NextPage<PageProps> = () => (
  <>
    <NextSeo />
    Hi, there
  </>
)

export default CategoryPage
