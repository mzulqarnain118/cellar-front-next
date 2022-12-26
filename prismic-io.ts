import { ClientConfig, createClient, getRepositoryName } from '@prismicio/client'
import { CreateClientConfig, enableAutoPreviews } from '@prismicio/next'

import sm from './sm.json'

/**
 * The project's Prismic repository name.
 */
export const repositoryName = getRepositoryName(sm.apiEndpoint)

// Update the routes array to match your project's route structure
const routes: ClientConfig['routes'] = [
  {
    path: '/',
    type: 'home_page',
  },
]

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
