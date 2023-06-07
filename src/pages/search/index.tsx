import { useMemo } from 'react'

import { useRouter } from 'next/router'

import { Content } from '@prismicio/client'
import { FilledContentRelationshipField } from '@prismicio/types'
import { dehydrate } from '@tanstack/react-query'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { NextSeo } from 'next-seo'

import { PlpShell } from '@/components/plp-shell'
import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_SORT, Sort } from '@/components/product-listing'
import { PAGINATED_SEARCH_QUERY_KEY, getPaginatedSearchResult } from '@/features/search/queries'
import { getStaticNavigation } from '@/lib/queries/header'
import { PAGINATED_PRODUCTS_QUERY_KEY, getPaginatedProducts } from '@/lib/queries/products'
import { createClient } from '@/prismic-io'

export const getServerSideProps: GetServerSideProps = async ({
  previewData,
  query,
}: GetServerSidePropsContext) => {
  const { q } = query
  const searchQuery = q?.toString()

  if (!query?.q || !searchQuery) {
    return {
      props: {},
    }
  }

  let limit = DEFAULT_LIMIT
  let page = DEFAULT_PAGE
  let sort: Sort = DEFAULT_SORT
  let search = ''

  if (query?.limit) {
    limit = parseInt(query.limit.toString())
  }
  if (query?.page) {
    page = parseInt(query.page.toString())
  }
  if (query?.sort) {
    sort = query.sort.toString() as Sort
  }
  if (query?.q) {
    search = query.q.toString()
  }

  if (search.length === 0) {
    return {
      props: {},
    }
  }

  const client = createClient({ previewData })
  const [queryClient, pageData] = await Promise.all([
    getStaticNavigation(client),
    client.getByUID<Content.PlpDocument>('plp', 'wine', {
      graphQuery: `{
        plp {
          ...plpFields
          enabled_filters {
            filter {
              ...on filter {
                ...filterFields
              }
            }
          }
        }
      }`,
    }),
  ])

  if (!pageData) {
    return {
      notFound: true,
    }
  }

  const categories = (pageData as Content.PlpDocument)?.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)

  await Promise.all([
    queryClient.prefetchQuery(
      [PAGINATED_SEARCH_QUERY_KEY, { categories, limit, page, search, sort }],
      getPaginatedSearchResult
    ),
    queryClient.prefetchQuery(
      [...PAGINATED_PRODUCTS_QUERY_KEY, { categories, limit, page, sort }],
      getPaginatedProducts
    ),
  ])

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: pageData || null,
    },
  }
}

const SearchPage = ({ page }: { page: Content.PlpDocument | null }) => {
  const router = useRouter()
  const currentPage = router.query.page ? parseInt(router.query.page.toString()) : DEFAULT_PAGE
  const categories = page?.data.display_categories
    .map(category => category.display_category_id)
    .map(Number)
  const limit = router.query.limit ? parseInt(router.query.limit.toString()) : DEFAULT_LIMIT
  const sort: Sort = router.query.sort ? (router.query.sort.toString() as Sort) : DEFAULT_SORT
  const search = router.query.q ? router.query.q.toString() : undefined
  const enabledFilters = useMemo(
    () =>
      page?.data.enabled_filters
        .map(({ filter }) => {
          if (filter.link_type !== 'Any' && 'slug' in filter) {
            return filter
          }
        })
        .filter(Boolean) || [],
    [page?.data.enabled_filters]
  )

  return (
    <>
      <NextSeo />
      <PlpShell
        categories={categories}
        enabledFilters={
          enabledFilters as FilledContentRelationshipField<
            'filter',
            string,
            Content.FilterDocumentData
          >[]
        }
        limit={limit}
        page={currentPage}
        search={search}
        sort={sort}
      />
    </>
  )
}

export default SearchPage
