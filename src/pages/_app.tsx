import { useState } from 'react'

import { Inter, Montserrat } from '@next/font/google'
import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { Hydrate, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import Link from 'next/link'

import { repositoryName } from 'prismic-io'
import { RootLayout } from 'src/components/layouts/root'

import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

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
          <PrismicProvider internalLinkComponent={props => <Link {...props} />}>
            <PrismicPreview repositoryName={repositoryName}>
              <RootLayout>
                <style global jsx>
                  {`
                    :root {
                      --font-inter: ${inter.style.fontFamily};
                      --font-montserrat: ${montserrat.style.fontFamily};
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
