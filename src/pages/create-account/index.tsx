import { dehydrate } from '@tanstack/react-query'
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { Typography } from '@/core/components/typogrpahy'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'

import { CreateAccountForm } from 'src/features/create-account/form'

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })
  const queryClient = await getStaticNavigation(client)

  return { props: { dehydratedState: dehydrate(queryClient) } }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const CreateAccountPage: NextPage<PageProps> = () => (
  <>
    <NextSeo title="Create account" />
    <main className="container mx-auto flex items-center justify-center py-16">
      <div
        className={`
          relative max-w-3xl space-y-4 rounded border border-solid border-base-dark
          bg-[#fafafa] px-10 py-10 md:px-20
        `}
      >
        <Typography as="h1" displayAs="h2">
          Create Account
        </Typography>
        <CreateAccountForm />
      </div>
    </main>
  </>
)

export default CreateAccountPage
