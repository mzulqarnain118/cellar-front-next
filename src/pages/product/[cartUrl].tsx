import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'

import { useRouter } from 'next/router'

import { asText } from '@prismicio/helpers'
import { dehydrate } from '@tanstack/react-query'

import { getStaticNavigation } from '@/lib/queries/header'
import { getProductByCartUrl, PRODUCTS_QUERY_KEY, useProductQuery } from '@/lib/queries/products'

import { createClient } from 'prismic-io'

export const getServerSideProps: GetServerSideProps = async ({ params, previewData }) => {
  const client = createClient({ previewData })
  const cartUrl = params?.cartUrl?.toString()

  if (!cartUrl) {
    return {
      notFound: true,
    }
  }

  // ! TODO: Convert Prismic PDP UID from SKU to Cart URL.
  const [queryClient, pdps] = await Promise.all([
    getStaticNavigation(client),
    client.getAllByType('pdp'),
  ])
  const page = pdps.find(pdp => asText(pdp.data.url) === cartUrl)

  if (!page) {
    return {
      notFound: true,
    }
  }

  await queryClient.prefetchQuery([...PRODUCTS_QUERY_KEY, cartUrl], getProductByCartUrl)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const PDP: NextPage<PageProps> = ({ page: _page }) => {
  const {
    query: { cartUrl },
  } = useRouter()
  const { data: _data } = useProductQuery(cartUrl?.toString() || '')

  return <>PDP hi</>
}

export default PDP
