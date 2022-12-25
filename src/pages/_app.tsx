import { useState } from 'react'

import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Link from 'next/link'

import { repositoryName } from 'prismic-io'
import { RootLayout } from 'src/components/layouts/root'
import '../globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <PrismicProvider internalLinkComponent={props => <Link {...props} />}>
          <PrismicPreview repositoryName={repositoryName}>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </PrismicPreview>
        </PrismicProvider>
        <ReactQueryDevtools />
      </Hydrate>
    </QueryClientProvider>
  )
}
