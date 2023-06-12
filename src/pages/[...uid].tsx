import Error from 'next/error'

import { Content, asLink } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicRichText, SliceZone } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'
import type { GetStaticPaths, GetStaticPropsContext } from 'next'
import { NextSeo } from 'next-seo'

import { components } from '@/components/slices'
import { ContactForm } from '@/features/contact/components/form'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'

export const getStaticProps = async ({
  params,
  previewData,
}: GetStaticPropsContext<{ uid: string }>) => {
  const client = createClient({ previewData })
  const uid = params?.uid?.toString()
  let page

  if (uid === undefined) {
    return {
      redirect: {
        destination: HOME_PAGE_PATH,
        permanent: false,
      },
    }
  }

  try {
    if (uid !== undefined) {
      page = await client.getByUID<Content.RichContentPageDocument>('rich_content_page', uid)

      if (!page) {
        page = await client.getByUID<Content.ContentPageDocument>('content_page', uid)
      }
    }

    if (!page) {
      return {
        notFound: true,
      }
    }
  } catch (error) {
    page = await client.getByUID<Content.ContentPageDocument>('content_page', uid)

    if (!page) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        page: page || null,
      },
    }
  }
  const queryClient = await getStaticNavigation(client)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      page: page || null,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient()
  const [pages, contentPages] = await Promise.all([
    client.getAllByType('rich_content_page'),
    client.getAllByType('content_page'),
  ])
  const paths = pages
    .filter(page => page.data.page_type === 'Default' && page.uid !== 'home')
    // .map(page => asLink(page) as string)
    .map(page => `/${page.uid}`)
  const contentPagesPaths = contentPages.map(page => asLink(page) || undefined).filter(Boolean)

  return {
    fallback: true,
    paths: [...paths, ...contentPagesPaths],
  }
}

const RichContentPage = ({
  page,
}: {
  page?: Content.RichContentPageDocument | Content.ContentPageDocument | null
}) => {
  if (page?.type === 'rich_content_page') {
    return (
      <>
        <NextSeo
          description={asText(page?.data.meta_description)}
          title={asText(page?.data.meta_title)}
        />
        <main>
          <SliceZone components={components} slices={page?.data.body} />
        </main>
      </>
    )
  }

  if (page?.type === 'content_page') {
    const isContactPage = page?.uid.startsWith('contact')

    return (
      <div className="bg-base-light">
        <div
          className="flex justify-center items-center text-neutral-50 h-96 w-full"
          style={{
            background: `linear-gradient( rgba(0, 0, 0, .5), rgba(0, 0, 0, .5) ), url(${page?.data.header_img.url}) no-repeat`,
            backgroundSize: 'cover',
          }}
        >
          <PrismicRichText field={page?.data.title} />
        </div>
        <div className="container mx-auto my-24">
          <div className="justify-center grid">
            <div>
              <div className="[&>p]:my-4 [&>h6]:mb-2 [&>ul]:mb-4 [&>ul]:pl-10 [&>ul]:list-disc">
                <PrismicRichText field={page?.data.body} />
              </div>
              {isContactPage ? <ContactForm /> : undefined}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <Error statusCode={404} />
}

export default RichContentPage
