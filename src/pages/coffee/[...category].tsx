import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { asLink } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_SORT, Sort } from '@/components/product-listing'
import { WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { PAGINATED_PRODUCTS_QUERY_KEY, getPaginatedProducts } from '@/lib/queries/products'
import { createClient, linkResolver } from '@/prismic-io'

const ProductListing = dynamic(
  import('@/components/product-listing').then(module => module.ProductListing),
  { ssr: false }
)

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

  const categories = page.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)

  let limit = DEFAULT_LIMIT
  let pageNumber = DEFAULT_PAGE
  let sort: Sort = DEFAULT_SORT

  if (params?.limit) {
    limit = parseInt(params.limit.toString())
  }
  if (params?.page) {
    pageNumber = parseInt(params.page.toString())
  }
  if (params?.sort) {
    sort = params.sort.toString() as Sort
  }

  await queryClient.prefetchQuery(
    [...PAGINATED_PRODUCTS_QUERY_KEY, { categories, limit, page: pageNumber, sort }],
    getPaginatedProducts
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: page || null,
    },
    revalidate: 120,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const pages = await client.getAllByType('category_page', {
    graphQuery: `{
      category_page {
        ...category_pageFields
        parent_page {
          ...on plp {
            uid
          }
        }
      }
    }`,
  })
  const paths = pages
    .filter(
      page =>
        page.data.parent_page.link_type !== 'Any' &&
        'uid' in page.data.parent_page &&
        page.data.parent_page.uid === 'coffee'
    )
    .map(page => asLink(page, linkResolver) as string)
    .filter(Boolean)

  return {
    fallback: true,
    paths,
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const CategoryPage: NextPage<PageProps> = ({ page }) => {
  const categories = page?.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)
  const router = useRouter()
  const currentPage = router.query.page ? parseInt(router.query.page.toString()) : DEFAULT_PAGE
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

export default CategoryPage
