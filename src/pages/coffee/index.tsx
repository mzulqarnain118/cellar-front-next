import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Content } from '@prismicio/client'
import { dehydrate } from '@tanstack/react-query'
import { GetServerSideProps as GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'

import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_SORT, Sort } from '@/components/product-listing'
import { getStaticNavigation } from '@/lib/queries/header'
import { PAGINATED_PRODUCTS_QUERY_KEY, getPaginatedProducts } from '@/lib/queries/products'
import { createClient } from '@/prismic-io'

const ProductListing = dynamic(
  import('@/components/product-listing').then(module => module.ProductListing),
  { ssr: false }
)

export const getStaticProps: GetStaticProps = async ({ previewData, query }) => {
  let limit = DEFAULT_LIMIT
  let page = DEFAULT_PAGE
  let sort: Sort = DEFAULT_SORT

  if (query?.limit) {
    limit = parseInt(query.limit.toString())
  }
  if (query?.page) {
    page = parseInt(query.page.toString())
  }
  if (query?.sort) {
    sort = query.sort.toString() as Sort
  }

  const client = createClient({ previewData })
  const [queryClient, pageData] = await Promise.all([
    getStaticNavigation(client),
    client.getByUID<Content.PlpDocument>('plp', 'coffee'),
  ])

  const categories = pageData.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)

  await queryClient.prefetchQuery(
    [...PAGINATED_PRODUCTS_QUERY_KEY, { categories, limit, page, sort }],
    getPaginatedProducts
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: pageData || null,
    },
    revalidate: 120,
  }
}

const PLP = ({ page }: { page: Content.PlpDocument | null }) => {
  const router = useRouter()
  const currentPage = router.query.page ? parseInt(router.query.page.toString()) : DEFAULT_PAGE
  const categories = page?.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)
  const limit = router.query.limit ? parseInt(router.query.limit.toString()) : DEFAULT_LIMIT
  const sort: Sort = router.query.sort ? (router.query.sort.toString() as Sort) : DEFAULT_SORT

  return (
    <>
      <NextSeo />
      <main className="py-10">
        <div className="container mx-auto">
          <ProductListing categories={categories} limit={limit} page={currentPage} sort={sort} />
        </div>
      </main>
    </>
  )
}

export default PLP
