import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'

import { Content } from '@prismicio/client'
import { dehydrate } from '@tanstack/react-query'

import { getStaticNavigation } from '@/lib/queries/header'

import { createClient } from 'prismic-io'

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const page = await client.getByUID<Content.PlpDocument>('plp', 'wine')
  const queryClient = await getStaticNavigation(client)

  return {
    props: { dehydratedState: dehydrate(queryClient), page },
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const PLP: NextPage<PageProps> = () => <>PLP</>

export default PLP
