import { useState } from 'react'

import { Inter, Montserrat } from '@next/font/google'
import { PrismicPreview } from '@prismicio/next'
import { PrismicProvider } from '@prismicio/react'
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { AppProps } from 'next/app'
import Link from 'next/link'

import { repositoryName } from 'prismic-io'
import { RootLayout } from 'src/components/layouts/root'

import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}
