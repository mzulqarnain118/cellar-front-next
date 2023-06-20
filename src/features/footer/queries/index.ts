import type { Client, Content } from '@prismicio/client'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/prismic-io'

export const getFooter = async (client?: Client<Content.AllDocumentTypes>) => {
  const prismicClient = client || createClient()

  if (prismicClient !== undefined) {
    return prismicClient.getSingle('footer')
  }
}

export const FOOTER_QUERY_KEY = 'footer'

export const useFooterQuery = () =>
  useQuery({
    cacheTime: 15 * (60 * 1000),
    queryFn: () => getFooter(),
    queryKey: [FOOTER_QUERY_KEY],
    staleTime: 10 * (60 * 1000),
  })
