import { useState } from 'react'

import { DefaultSeo } from 'next-seo'
import defaultSEOConfig from 'next-seo.config'

import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Merriweather } from 'next/font/google'

import { MantineProvider, MantineThemeOverride } from '@mantine/core'
import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { Hydrate, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  PersistQueryClientOptions,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'
import { SessionProvider } from 'next-auth/react'

import { RootLayout } from '@/components/layouts/root'

import { InternalLink } from 'prismic/internal-link'
import { richTextComponents } from 'prismic/rich-text-components'

import { linkResolver, repositoryName } from 'prismic-io'

import '../globals.css'

const ProgressBar = dynamic(
  () => import('src/components/progress-bar').then(module => module.ProgressBar),
  { ssr: false }
)
const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: '400',
})

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})

const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  dehydrateOptions: {
    shouldDehydrateQuery: query => Boolean(query.meta?.persist) ?? false,
  },
  persister,
}

const theme: MantineThemeOverride = {
  colorScheme: 'light',
  colors: {
    brand: [
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
      '#464c2c',
    ],
  },
  components: {
    NavLink: {
      classNames: { label: 'text-base' },
    },
  },
  cursorType: 'pointer',
  defaultRadius: 4,
  fontFamily: 'Proxima Nova, sans-serif',
  headings: {
    fontFamily: 'Merriweather, Georgia, serif',
  },
  primaryColor: 'brand',
}

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
        },
      })
  )

  return (
    <SessionProvider session={session}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <Hydrate state={pageProps.dehydratedState}>
          <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
            <PrismicProvider
              internalLinkComponent={InternalLink}
              linkResolver={linkResolver}
              richTextComponents={richTextComponents}
            >
              <PrismicPreview repositoryName={repositoryName}>
                <DefaultSeo {...defaultSEOConfig} />
                <RootLayout>
                  <style global jsx>
                    {`
                      :root {
                        --font-merriweather: ${merriweather.style.fontFamily};
                      }

                      #nprogress .bar {
                        background: #464c2c !important;
                        height: 0.25rem !important;
                      }

                      #nprogress .peg {
                        box-shadow: 0 0 10px #464c2c, 0 0 5px #464c2c !important;
                      }
                    `}
                  </style>
                  <Component {...pageProps} />
                  <ProgressBar />
                </RootLayout>
              </PrismicPreview>
            </PrismicProvider>
          </MantineProvider>
          <ReactQueryDevtools />
        </Hydrate>
      </PersistQueryClientProvider>
    </SessionProvider>
  )
}

export default App
