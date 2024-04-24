import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { Content } from '@prismicio/client'
import { PrismicRichText, PrismicText } from '@prismicio/react'
import * as prismicT from '@prismicio/types'
import algoliasearch from 'algoliasearch/lite'
import { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { FormProvider, UseFormProps, useForm } from 'react-hook-form'
import { InstantSearch } from 'react-instantsearch'
import { z } from 'zod'

import Hits from '@/components/consultant/hits'
import { Typography } from '@/core/components/typogrpahy'
import { ConsultantPageSearch } from '@/features/create-account/consultant/consultantPageSearch'
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

let zeroResultTips: prismicT.RichTextField

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
  zeroResultTips = data?.zero_result_description

  const methods = useForm(formProps)
  const { control } = methods
  const router = useRouter()
  const [consultantInputValue, setConsultantInputValue] = useState('')

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
          <div className="grid grid-cols-12 gap-8 lg:gap-20 min-[1535px]:gap-40">
            <InstantSearch indexName={algoliaIndex} searchClient={searchClient}>
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
                    <ConsultantPageSearch
                      consultantInputValue={consultantInputValue}
                      control={control}
                      handleSelect={handleSelect}
                      name="consultant"
                      setConsultantInputValue={setConsultantInputValue}
                    />
                  </FormProvider>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-8 min-[1535px]:col-span-6 space-y-4">
                <Hits
                  consultantInputValue={consultantInputValue}
                  setConsultantInputValue={setConsultantInputValue}
                  zeroResultDescription={data.zero_result_description}
                />
              </div>
            </InstantSearch>
          </div>
        </div>
      </main>
    </>
  )
}

// const Content = connectStateResults(({ searchState, searchResults }) => {
//   if (searchState && searchState.query && searchResults) {
//     if (searchResults.nbHits !== 0) {
//       return (
//         <div>
//           <Hits hitComponent={Hit} />
//           <div className="pagination">
//             <Pagination />
//           </div>
//         </div>
//       )
//     } else {
//       return <EmptySearchResult searchState={searchState} />
//     }
//   }
//   if (searchState && !searchState.query && !!zeroResultTips) {
//     return <PrismicRichText field={zeroResultTips} />
//   }
//   return <></>
// })

export default ConsultantsPage
