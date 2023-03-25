import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { SliceZone } from '@prismicio/react'
import { dehydrate } from '@tanstack/react-query'

import { components } from '@/components/slices'
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

function IconOne() {
  return (
    <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#FFEDD5" height="48" rx="8" width="48" />
      <path
        d="M24 11L35.2583 17.5V30.5L24 37L12.7417 30.5V17.5L24 11Z"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        clipRule="evenodd"
        d="M16.7417 19.8094V28.1906L24 32.3812L31.2584 28.1906V19.8094L24 15.6188L16.7417 19.8094Z"
        fillRule="evenodd"
        stroke="#FDBA74"
        strokeWidth="2"
      />
      <path
        clipRule="evenodd"
        d="M20.7417 22.1196V25.882L24 27.7632L27.2584 25.882V22.1196L24 20.2384L20.7417 22.1196Z"
        fillRule="evenodd"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconTwo() {
  return (
    <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#FFEDD5" height="48" rx="8" width="48" />
      <path
        d="M28.0413 20L23.9998 13L19.9585 20M32.0828 27.0001L36.1242 34H28.0415M19.9585 34H11.8755L15.9171 27"
        stroke="#FB923C"
        strokeWidth="2"
      />
      <path
        clipRule="evenodd"
        d="M18.804 30H29.1963L24.0001 21L18.804 30Z"
        fillRule="evenodd"
        stroke="#FDBA74"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconThree() {
  return (
    <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#FFEDD5" height="48" rx="8" width="48" />
      <rect fill="#FDBA74" height="4" width="2" x="13" y="32" />
      <rect fill="#FDBA74" height="8" width="2" x="17" y="28" />
      <rect fill="#FDBA74" height="12" width="2" x="21" y="24" />
      <rect fill="#FDBA74" height="16" width="2" x="25" y="20" />
      <rect fill="#FB923C" height="20" width="2" x="29" y="16" />
      <rect fill="#FB923C" height="24" width="2" x="33" y="12" />
    </svg>
  )
}

const solutions = [
  {
    description: 'Measure actions your users take',
    href: '##',
    icon: IconOne,
    name: 'Insights',
  },
  {
    description: 'Create your own targeted content',
    href: '##',
    icon: IconTwo,
    name: 'Automations',
  },
  {
    description: 'Keep track of your growth',
    href: '##',
    icon: IconThree,
    name: 'Reports',
  },
]

const HomePage: NextPage<PageProps> = ({ page }: PageProps) => (
  <>
    <NextSeo
      description={asText(page?.data.meta_description)}
      title={asText(page?.data.meta_title)}
    />
    <SliceZone components={components} slices={page?.data.body} />
  </>
)

export default HomePage
