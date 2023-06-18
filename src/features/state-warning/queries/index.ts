import { Client, Content } from '@prismicio/client'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/prismic-io'

export const getStateWarnings = async (client?: Client<Content.AllDocumentTypes>) => {
  try {
    const prismicClient = client || createClient()
    const warnings = await prismicClient.getSingle('state_warning')

    return warnings
  } catch {
    return null
  }
}

export const STATE_WARNINGS_QUERY_KEY = 'state-warnings'

export const useStateWarningsQuery = () =>
  useQuery({
    cacheTime: 15 * (60 * 1000), // 15 mins
    queryFn: () => getStateWarnings(),
    queryKey: [STATE_WARNINGS_QUERY_KEY],
    staleTime: 10 * (60 * 1000), // 10 mins
  })
