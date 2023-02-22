import type { Client, Content } from '@prismicio/client'
import { QueryClient, useQuery } from '@tanstack/react-query'

import { createClient } from 'prismic-io'

export const HEADER_NAVIGATION_KEY = ['header-navigation']

const graphQuery = `{
  navigation_menu {
    body {
      ...on navigation_link {
        non-repeat {
          ...non-repeatFields
        }
        repeat {
          child_link {
            ...on navigation_menu {
              body {
                ...on navigation_link {
                  non-repeat {
                    ...non-repeatFields
                  }
                  repeat {
                    ...repeatFields
                  }
                }
              }
            }
          }
          child_name
        }
      }
    }
  }
}`

export const useNavigationQuery = () =>
  useQuery({
    cacheTime: 15 * (60 * 1000), // 15 mins
    queryFn: () => getNavigation(),
    queryKey: HEADER_NAVIGATION_KEY,
    staleTime: 10 * (60 * 1000), // 10 mins
  })

export const getNavigation = (client?: Client<Content.AllDocumentTypes>) => {
  const prismicClient = client || createClient()

  if (prismicClient !== undefined) {
    return prismicClient.getByUID<Content.NavigationMenuDocument>('navigation_menu', 'header', {
      graphQuery,
    })
  }
}

export const getStaticNavigation = async (client: Client<Content.AllDocumentTypes>) => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(HEADER_NAVIGATION_KEY, () => getNavigation(client))
  return queryClient
}
