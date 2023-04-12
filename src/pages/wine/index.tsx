import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { dehydrate } from '@tanstack/react-query'

import { Sort } from '@/components/product-listing'
import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
import { getStaticNavigation } from '@/lib/queries/header'
import { PAGINATED_PRODUCTS_QUERY_KEY, getPaginatedProducts } from '@/lib/queries/products'

import { createClient } from 'prismic-io'

const ProductListing = dynamic(
  import('@/components/product-listing').then(module => module.ProductListing),
  { ssr: false }
)

export const getServerSideProps: GetServerSideProps = async ({ previewData, query }) => {
  let categories: number[] = [DISPLAY_CATEGORY.Wine]
  let limit = 16
  let page = 1
  let sort: Sort = 'relevant'
  if (query.categories) {
    categories = query.categories.toString().split(',').map(Number)
  }
  if (query.limit) {
    limit = parseInt(query.limit.toString())
  }
  if (query.page) {
    page = parseInt(query.page.toString())
  }
  if (query.sort) {
    sort = query.sort.toString() as Sort
  }
  const client = createClient({ previewData })
  const [queryClient, pageData] = await Promise.all([
    getStaticNavigation(client),
    client.getByUID('plp', 'wine'),
  ])

  await queryClient.prefetchQuery(
    [...PAGINATED_PRODUCTS_QUERY_KEY, JSON.stringify({ categories, limit, page, sort })],
    getPaginatedProducts
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: pageData,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const PLP: NextPage<PageProps> = () => {
  const router = useRouter()
  const currentPage = router.query.page ? parseInt(router.query.page.toString()) : 1
  const categories = router.query.categories
    ? router.query.categories.toString().split(',').map(Number)
    : [DISPLAY_CATEGORY.Wine]
  const limit = router.query.limit ? parseInt(router.query.limit.toString()) : 16
  const sort: Sort = router.query.sort ? (router.query.sort.toString() as Sort) : 'relevant'

  return (
    <>
      <NextSeo />
      <div className="py-10">
        <div className="container mx-auto">
          <ProductListing categories={categories} limit={limit} page={currentPage} sort={sort} />
        </div>
      </div>
    </>
  )
}

export default PLP
