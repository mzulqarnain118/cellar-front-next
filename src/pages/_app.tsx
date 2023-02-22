import { useState } from 'react'

import { DefaultSeo } from 'next-seo'
import defaultSEOConfig from 'next-seo.config'

import type { AppProps } from 'next/app'
import Link from 'next/link'

import { Inter, Merriweather } from '@next/font/google'
import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { Hydrate, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { SessionProvider } from 'next-auth/react'

import { RootLayout } from '@/components/layouts/root'
import { Typography } from '@/core/components/typogrpahy'
import { parsePrismicRichText } from '@/lib/utils/prismic'

import { linkResolver, repositoryName } from 'prismic-io'

import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: '400',
})

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})

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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          dehydrateOptions: {
            shouldDehydrateQuery: query => Boolean(query.meta?.persist) ?? false,
          },
          persister,
        }}
      >
        <Hydrate state={pageProps.dehydratedState}>
          <PrismicProvider
            internalLinkComponent={props => <Link {...props} />}
            linkResolver={linkResolver}
            richTextComponents={{
              heading1: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h1">
                    {content ? content : children}
                  </Typography>
                )
              },
              heading2: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h2">
                    {content ? content : children}
                  </Typography>
                )
              },
              heading3: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h3">
                    {content ? content : children}
                  </Typography>
                )
              },
              heading4: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h4">
                    {content ? content : children}
                  </Typography>
                )
              },
              heading5: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h5">
                    {content ? content : children}
                  </Typography>
                )
              },
              heading6: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="h6">
                    {content ? content : children}
                  </Typography>
                )
              },
              paragraph: ({ children, key, text = '', node: { spans } }) => {
                const content = parsePrismicRichText(text, spans)

                return (
                  <Typography key={key} as="p">
                    {content ? content : children}
                  </Typography>
                )
              },
            }}
          >
            <PrismicPreview repositoryName={repositoryName}>
              <DefaultSeo {...defaultSEOConfig} />
              <RootLayout>
                <style global jsx>
                  {`
                    :root {
                      --font-inter: ${inter.style.fontFamily};
                      --font-merriweather: ${merriweather.style.fontFamily};
                    }
                  `}
                </style>
                <Component {...pageProps} />
              </RootLayout>
            </PrismicPreview>
          </PrismicProvider>
          <ReactQueryDevtools />
        </Hydrate>
      </PersistQueryClientProvider>
    </SessionProvider>
  )
}

export default App
