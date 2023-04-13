import { useState } from 'react'

import { DefaultSeo } from 'next-seo'
import defaultSEOConfig from 'next-seo.config'

import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Merriweather } from 'next/font/google'

import { MantineProvider, MantineThemeOverride } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
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
    accent: [
      '#FCFBFA',
      '#DDD0C6',
      '#C2AC9A',
      '#AD8F76',
      '#97765B',
      '#7E624C',
      '#69523F',
      '#544232',
      '#433428',
      '#362A20',
    ],
    brand: [
      '#C0C79F',
      '#A7B179',
      '#919E5B',
      '#79834C',
      '#656D3F',
      '#545B35',
      '#464C2C',
      '#383D23',
      '#2D311C',
      '#242717',
    ],
    neutral: [
      '#D6D6D6',
      '#B3B3B3',
      '#959595',
      '#7C7C7C',
      '#636363',
      '#4F4F4F',
      '#3F3F3F',
      '#333333',
      '#292929',
      '#212121',
    ],
    product: [
      '#E6D4D4',
      '#CAA6A6',
      '#B47F7F',
      '#A15F5F',
      '#864F4F',
      '#6B3F3F',
      '#563333',
      '#452828',
      '#372020',
      '#2C1A1A',
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
            <Notifications position="top-center" />
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
