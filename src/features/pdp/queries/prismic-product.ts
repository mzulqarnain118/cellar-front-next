import { Content } from '@prismicio/client'
import { QueryFunction, useQuery } from '@tanstack/react-query'

import { createClient } from '@/prismic-io'

export const getPrismicProduct: QueryFunction<Content.PdpDocument, string[]> = async ({
  queryKey,
}) => {
  const client = createClient()
  return await client.getByUID<Content.PdpDocument>('pdp', queryKey[1])
}

export const usePrismicProductQuery = (cartUrl: string) =>
  useQuery({ queryFn: getPrismicProduct, queryKey: ['prismic-product', cartUrl] })
