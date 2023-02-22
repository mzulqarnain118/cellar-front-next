import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import Link from 'next/link'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import type { Content } from '@prismicio/client'
import { dehydrate } from '@tanstack/react-query'

import { WINE_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'

import { createClient } from 'prismic-io'

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const queryClient = await getStaticNavigation(client)
  const page = await client.getByUID<Content.RichContentPageDocument>('rich_content_page', 'home')

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page,
    },
  }
}

const HomePage: NextPage<PageProps> = () => (
  <>
    <NextSeo />
    <div>
      <div className="flex h-[80vh] w-full items-center justify-center bg-neutral-900/50 bg-[url('/vineyard-bg.jpg')] bg-scroll bg-center lg:bg-fixed">
        <div className="container mx-auto py-8 text-neutral-100 lg:py-32">
          <div className="flex flex-col items-center justify-center gap-6 text-center tracking-wider lg:items-start lg:gap-8 lg:text-left">
            <div>
              <h1 className="lg:mb-8">Live Clean-Crafted.</h1>
              <h2 className="text-4xl font-semibold leading-tight">
                <span className="block">Better for you.</span>
                <span className="block">Better for the planet.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                aria-label="Buy Clean-Crafted Wine"
                className="flex max-w-full items-center justify-center"
                href={WINE_PAGE_PATH}
                role="button"
              >
                <div
                  className={`
                      flex h-6 max-w-full items-center justify-center gap-2 rounded-lg border-2
                      border-[#337250] bg-[#337250] px-9 py-7 font-semibold
                      tracking-wide text-[#F2F2F2] transition-all hover:border-[#26563C]
                      hover:bg-[#26563C] active:bg-[#152F21] lg:h-12
                    `}
                >
                  Buy Clean-Crafted Wine
                  <ChevronRightIcon className="h-6 w-6" />
                </div>
              </Link>

              <Link
                aria-label="Discover the Clean-Crafted Commitment"
                className="w-fit text-neutral-100 hover:underline"
                href="/clean-crafted"
                role="button"
              >
                What is Clean-Crafted?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)

export default HomePage
