import { Suspense, lazy, useEffect, useState } from 'react'

import type { AppProps, NextWebVitalsMetric } from 'next/app'
import dynamic from 'next/dynamic'
import { Merriweather } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'

import { init, isInitialized } from '@fullstory/browser'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { Hydrate, QueryClient } from '@tanstack/react-query'
import {
  PersistQueryClientOptions,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'
import { SessionProvider } from 'next-auth/react'
import { DefaultSeo } from 'next-seo'
import { GoogleAnalytics, event } from 'nextjs-google-analytics'
import { Theme } from 'react-daisyui'
import TagManager, { TagManagerArgs } from 'react-gtm-module'

import { RootLayout } from '@/components/layouts/root'
import { modals } from '@/core/components/modals'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { useCartOpen } from '@/lib/stores/process'
import { linkResolver, repositoryName } from '@/prismic-io'

import defaultSEOConfig from 'next-seo.config'
import { InternalLink } from 'prismic/internal-link'
import { richTextComponents } from 'prismic/rich-text-components'
import { theme } from 'theme'

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

const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/lib/index.prod.js').then(d => ({
    default: d.ReactQueryDevtools,
  }))
)

export const reportWebVitals = ({ id, label, name, value }: NextWebVitalsMetric) => {
  event(name, {
    category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    label: id,
    nonInteraction: true,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
  })
}

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const { cartOpen } = useCartOpen()
  const [showDevtools, setShowDevtools] = useState(false)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
        },
      })
  )

  useEffect(() => {
    const tagManagerArgs: TagManagerArgs = {
      gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? '',
    }

    if (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'false') {
      window.toggleDevtools = () => setShowDevtools(prev => !prev)
      setShowDevtools(true)
    }

    if (!isInitialized()) {
      init({ orgId: process.env.NEXT_PUBLIC_FULLSTORY_ORG_ID || '' })
    }
    TagManager.initialize(tagManagerArgs)
  }, [])

  return (
    <SessionProvider session={session}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <Hydrate state={pageProps.dehydratedState}>
          <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
            <Theme dataTheme="garden">
              <ModalsProvider modals={modals}>
                <Notifications position={isDesktop ? 'top-right' : 'top-right'} />
                <PrismicProvider
                  internalLinkComponent={InternalLink}
                  linkResolver={linkResolver}
                  richTextComponents={richTextComponents}
                >
                  <PrismicPreview repositoryName={repositoryName}>
                    <DefaultSeo {...defaultSEOConfig} />
                    <RootLayout>
                      <Head>
                        <meta content="width=device-width, initial-scale=1" name="viewport" />
                      </Head>
                      <style global jsx>
                        {`
                          :root {
                            --font-merriweather: ${merriweather.style.fontFamily};
                          }

                          #nprogress .bar {
                            background: #5c7f67 !important;
                            height: 0.25rem !important;
                          }

                          #nprogress .peg {
                            box-shadow: 0 0 10px #5c7f67, 0 0 5px #5c7f67 !important;
                          }

                          .linc-web-chat #linc-web-chat-iframe {
                            display: ${router.asPath.includes('product/') && !isDesktop
                              ? 'none'
                              : 'initial'};
                            right: ${cartOpen ? '453px !important' : '13px'};
                          }
                        `}
                      </style>
                      <GoogleAnalytics trackPageViews />
                      <Script
                        async
                        defer
                        id="hs-script-loader"
                        src="//js.hs-scripts.com/4801108.js"
                        type="text/javascript"
                      />
                      <Script id="handleTastryAddToCart">{`
                        window.handleTastryAddToCart = (sku) => {
                          if (typeof sku === 'string') {
                            window.sessionStorage.setItem('tastry-sku', JSON.stringify(sku.toLowerCase()));
                            const event = new Event('storage', { detail: sku.toLowerCase() });
                            window.dispatchEvent(event);
                          }
                        };
                    `}</Script>
                      <Script
                        id="tastry-quiz"
                        src="https://tastry-react-login.azurewebsites.net/js/tastry_scout.js"
                      />
                      <Component {...pageProps} />
                      <ProgressBar />
                    </RootLayout>
                  </PrismicPreview>
                </PrismicProvider>
              </ModalsProvider>
            </Theme>
          </MantineProvider>
          {showDevtools ? (
            <Suspense fallback={<></>}>
              <ReactQueryDevtoolsProduction />
            </Suspense>
          ) : undefined}
        </Hydrate>
      </PersistQueryClientProvider>
    </SessionProvider>
  )
}

export default App
