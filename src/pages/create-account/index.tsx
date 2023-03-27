import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { dehydrate } from '@tanstack/react-query'

import { getStaticNavigation } from '@/lib/queries/header'

import { CreateAccountForm } from 'src/features/create-account/form'

import { createClient } from 'prismic-io'

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })
  const queryClient = await getStaticNavigation(client)

  return { props: { dehydratedState: dehydrate(queryClient) } }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const CreateAccountPage: NextPage<PageProps> = () => (
  <>
    <NextSeo />
    <div className="container mx-auto my-16 flex items-center justify-center">
      <div
        className={`
          max-w-3xl space-y-4 rounded-lg border border-neutral-300 bg-neutral-50 py-10 px-10
          md:px-20
        `}
      >
        <h3>Create Account</h3>
        <CreateAccountForm />
      </div>
    </div>
  </>
)

export default CreateAccountPage
