import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'

import { Content } from '@prismicio/client'
import { dehydrate } from '@tanstack/react-query'

import { getStaticNavigation } from '@/lib/queries/header'
import {
  getPaginatedProducts,
  PAGINATED_PRODUCTS_QUERY_KEY,
  usePaginatedProducts,
} from '@/lib/queries/products'

import { createClient } from 'prismic-io'

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const [page, queryClient] = await Promise.all([
    client.getByUID<Content.PlpDocument>('plp', 'wine'),
    getStaticNavigation(client),
  ])

  await queryClient.prefetchQuery(
    [...PAGINATED_PRODUCTS_QUERY_KEY, JSON.stringify({ categories: [1], page: 1 })],
    getPaginatedProducts
  )

  return {
    props: { dehydratedState: dehydrate(queryClient), page },
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const PLP: NextPage<PageProps> = () => {
  const { data } = usePaginatedProducts({ categories: [1], page: 1 })
  const products = data?.products.map(product => (
    <span key={product.sku}>{product.displayName}</span>
  ))

  return <p>{products}</p>
}

export default PLP
