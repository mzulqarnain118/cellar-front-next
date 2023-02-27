import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'

import { useRouter } from 'next/router'

import { dehydrate } from '@tanstack/react-query'

import { ProductListing } from '@/components/product-listing'
import { getStaticNavigation } from '@/lib/queries/header'
import { getPaginatedProducts, PAGINATED_PRODUCTS_QUERY_KEY } from '@/lib/queries/products'

import { createClient } from 'prismic-io'

const categories: number[] = [1]

export const getServerSideProps: GetServerSideProps = async ({ previewData, query }) => {
  let page = 1
  if (query.page) {
    page = parseInt(query.page.toString())
  }
  const client = createClient({ previewData })
  const [queryClient, pageData] = await Promise.all([
    getStaticNavigation(client),
    client.getByUID('plp', 'wine'),
  ])

  await queryClient.prefetchQuery(
    [...PAGINATED_PRODUCTS_QUERY_KEY, JSON.stringify({ categories, page })],
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
  const limit = router.query.limit ? parseInt(router.query.limit.toString()) : 20

  return (
    <div className="py-10">
      <div className="container mx-auto">
        <ProductListing categories={categories} limit={limit} page={currentPage} />
      </div>
    </div>
  )
}

export default PLP
