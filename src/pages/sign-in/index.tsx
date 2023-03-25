import { FormEvent, useEffect, useState } from 'react'

import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { useRouter } from 'next/router'

import { dehydrate } from '@tanstack/react-query'
import { signIn, useSession } from 'next-auth/react'

import { HOME_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'

import { createClient } from 'prismic-io'

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })
  const queryClient = await getStaticNavigation(client)

  return { props: { dehydratedState: dehydrate(queryClient) } }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const SignInPage: NextPage<PageProps> = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await signIn('sign-in', { email, password, redirect: false })
    router.push(HOME_PAGE_PATH)
  }

  useEffect(() => {
    if (session?.user) {
      router.push(HOME_PAGE_PATH)
    }
  }, [router, session])

  if (session?.user) {
    return <></>
  }

  return (
    <>
      <NextSeo />
      <div className="container mx-auto">
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    </>
  )
}

export default SignInPage
