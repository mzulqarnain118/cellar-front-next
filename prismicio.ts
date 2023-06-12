import * as prismic from '@prismicio/client'
import * as prismicNext from '@prismicio/next'

import { HOME_PAGE_PATH } from '@/lib/paths'

import config from './slicemachine.config.json'

/**
 * The project's Prismic repository name.
 */
export const repositoryName = config.repositoryName

/**
 * A list of Route Resolver objects that define how a document's `url` field
 * is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
const routes: prismic.ClientConfig['routes'] = [
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
    path: '/:uid',
    type: 'plp',
  },
  {
    path: '/:parent/:uid',
    resolvers: {
      parent: 'parent_page',
    },
    type: 'category_page',
  },
  {
    path: '/brands',
    type: 'brand-landing-temp',
  },
  {
    path: '/brands/:uid',
    type: 'brand_page',
  },
  {
    path: '/product/:uid',
    type: 'pdp',
  },
  {
    path: '/our-growers',
    type: 'grower-template',
  },
  {
    path: '/growers/:uid',
    type: 'grower-details',
  },
]

/**
 * Tells Prismic how to navigate the site from PrismicLink and PrismicRichText components.
 */
export const linkResolver: prismic.LinkResolverFunction = document => document.url || HOME_PAGE_PATH
/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: prismicNext.CreateClientConfig = {}) => {
  const client = prismic.createClient(repositoryName, {
    defaultParams: {
      lang: process.env.NEXT_PUBLIC_PRISMIC_LANGUAGE,
    },
    routes,
    ...config,
  })

  prismicNext.enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  })

  return client
}
