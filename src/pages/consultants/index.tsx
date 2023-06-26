import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { Content } from '@prismicio/client'
import { PrismicRichText, PrismicText } from '@prismicio/react'
import algoliasearch from 'algoliasearch/lite'
import { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { FormProvider, UseFormProps, useForm } from 'react-hook-form'
import { InstantSearch } from 'react-instantsearch-hooks-web'
import { z } from 'zod'

import { Typography } from '@/core/components/typogrpahy'
import { ConsultantSearch } from '@/features/create-account/consultant/search'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANTS_PAGE_PATH } from '@/lib/paths'
import { Consultant } from '@/lib/types'
import { createClient } from '@/prismic-io'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ''
)
const algoliaIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'dev_consultants'

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })
  const data = await client.getSingle<Content.ConsultantSearchPageDocument>(
    'consultant_search_page'
  )

  return {
    props: {
      data,
    },
  }
}

const schema = z.object({
  consultant: z.string(),
})

const ConsultantsPage = ({ data: { data } }: { data: Content.ConsultantSearchPageDocument }) => {
  const formProps: UseFormProps = useMemo(
    () => ({
      defaultValues: {
        consultant: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(schema),
    }),
    []
  )
  const methods = useForm(formProps)
  const { control } = methods
  const router = useRouter()

  const handleSelect = useCallback(
    (consultant?: Consultant) => {
      if (consultant?.displayId !== CORPORATE_CONSULTANT_ID) {
        router.push(`${CONSULTANTS_PAGE_PATH}/${consultant?.url}`)
      }
    },
    [router]
  )

  return (
    <>
      <NextSeo title="Consultants" />
      <main>
        <div className="container mx-auto mb-10">
          <Typography as="h1" className="my-12" displayAs="h2">
            <PrismicText field={data.title} />
          </Typography>
          <div className="grid grid-cols-12 gap-8 lg:gap-40">
            <div className="rounded border border-neutral-light col-span-12 lg:col-span-4 h-max">
              <Typography
                as="h2"
                className="p-6 rounded-t bg-neutral-dark w-full text-neutral-50"
                displayAs="h4"
              >
                <PrismicText field={data.widget_name} />
              </Typography>
              <div className="p-6 bg-neutral-50 rounded-b">
                <PrismicRichText field={data.instructions} />
                <FormProvider {...methods}>
                  <InstantSearch indexName={algoliaIndex} searchClient={searchClient}>
                    <ConsultantSearch
                      control={control}
                      handleSelect={handleSelect}
                      name="consultant"
                    />
                  </InstantSearch>
                </FormProvider>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 space-y-4">
              <PrismicRichText field={data.zero_result_description} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ConsultantsPage
