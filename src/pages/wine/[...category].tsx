import { asLink } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient, linkResolver } from '@/prismic-io'

export const getStaticProps = async ({ params, previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  let uid
  if (params && params.category) {
    uid = params.category.toString()
  }

  let page
  if (uid !== undefined) {
    page = await client.getByUID('category_page', uid)
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
    revalidate: 120,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const pages = await client.getAllByType('category_page')
  const paths = pages.map(page => asLink(page, linkResolver) as string).filter(Boolean)

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
