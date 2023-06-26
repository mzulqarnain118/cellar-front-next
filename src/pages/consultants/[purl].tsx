import Error from 'next/error'

import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetServerSideProps } from 'next'
import { NextSeo } from 'next-seo'

import { BlurImage } from '@/components/blur-image'
import { Link } from '@/components/link'
import { Typography } from '@/core/components/typogrpahy'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CONSULTANT_QUERY_KEY, useConsultantQuery } from '@/lib/queries/consultant'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const queryClient = new QueryClient()
  const repUrl = query.prul?.toString()
  await queryClient.prefetchQuery([CONSULTANT_QUERY_KEY, repUrl || CORPORATE_CONSULTANT_ID])

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const ConsultantPage = () => {
  const { data: consultant } = useConsultantQuery()

  if (!consultant?.displayName.length) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <NextSeo title={`Consultants - ${consultant.displayName || consultant.url}`} />
      <main className="bg-[#f5f3f2]">
        <div className="container mx-auto">
          <BlurImage
            alt={consultant?.displayName || consultant?.url}
            height={70}
            src={consultant?.imageUrl || ''}
            width={70}
          />
          <Typography as="h2" displayAs="h5">
            {consultant?.displayName}
          </Typography>
          <ul>
            <li>
              {consultant?.emailAddress !== undefined ? (
                <Link href={'mailto: ' + consultant?.emailAddress}>{consultant?.emailAddress}</Link>
              ) : (
                <></>
              )}
            </li>
            <li>
              {consultant?.phoneNumber ? (
                <Link href={'tel: ' + consultant?.phoneNumber}>{consultant?.phoneNumber}</Link>
              ) : (
                <></>
              )}
            </li>
            <li>
              {consultant?.profileWebsite !== undefined ? (
                <div>
                  <Typography as="p">{consultant?.profileWebsite}</Typography>
                </div>
              ) : (
                <></>
              )}
            </li>
          </ul>
        </div>
      </main>
    </>
  )
}

export default ConsultantPage
