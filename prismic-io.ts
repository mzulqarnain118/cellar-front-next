import { ClientConfig, createClient, getRepositoryName } from '@prismicio/client'
import { LinkResolverFunction } from '@prismicio/helpers'
import { CreateClientConfig, enableAutoPreviews } from '@prismicio/next'

import { HOME_PAGE_PATH } from '@/lib/paths'

import sm from './sm.json'

/**
 * The project's Prismic repository name.
 */
export const repositoryName = getRepositoryName(sm.apiEndpoint)

// Update the routes array to match your project's route structure
const routes: ClientConfig['routes'] = [
  {
    path: '/',
    type: 'rich_content_page',
    uid: 'home',
  },
  {
    path: '/:uid',
    type: 'rich_content_page',
  },
  {
    path: '/wine',
    type: 'plp',
    uid: 'wine',
  },
  {
    path: '/:parent/:uid',
    resolvers: {
      parent: 'parent_page',
    },
    type: 'category_page',
  },
  {
    path: '/brands/:uid',
    type: 'brand_page',
  },
]

/**
 * Tells Prismic how to navigate the site from PrismicLink and PrismicRichText components.
 */
export const linkResolver: LinkResolverFunction = document => document.url || HOME_PAGE_PATH

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config {prismicNext.CreateClientConfig} - Configuration for the Prismic client.
 */
export const createLocalClient = (config: CreateClientConfig = {}) => {
  const client = createClient(sm.apiEndpoint, {
    defaultParams: {
      lang: process.env.NEXT_PUBLIC_PRISMIC_LANGUAGE,
    },
    routes,
    ...config,
  })

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  })

  return client
}

export { createLocalClient as createClient }
