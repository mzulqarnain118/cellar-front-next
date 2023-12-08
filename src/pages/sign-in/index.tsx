import { useCallback, useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingOverlay } from '@mantine/core'
import { dehydrate } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { PasswordInput } from '@/core/components/password-input'
import { Typography } from '@/core/components/typogrpahy'
import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import {
  CHECKOUT_PAGE_PATH,
  CREATE_ACCOUNT_PAGE_PATH,
  GUEST_CHECKOUT_PAGE_PATH,
  HOME_PAGE_PATH,
} from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { getStaticNavigation } from '@/lib/queries/header'
import { createClient } from '@/prismic-io'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  password: z.string().min(1, { message: 'Please enter your password.' }).trim(),
})

type SignInSchema = z.infer<typeof signInSchema>

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData })
  const queryClient = await getStaticNavigation(client)

  return { props: { dehydratedState: dehydrate(queryClient) } }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const SignInPage: NextPage<PageProps> = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: cart } = useCartQuery()

  const hasSubscriptionInCart = useMemo(
    () => cart?.items.some(item => item.subscribable),
    [cart?.items]
  )

  const { email = '', fullName = '', redirectTo = '' } = router.query

  const formOptions: UseFormProps<SignInSchema> = useMemo(
    () => ({
      defaultValues: { email: email?.toString() || '', password: '' },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(signInSchema),
    }),
    [email]
  )

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignInSchema>(formOptions)
  const [isLoading, setIsLoading] = useState(false)
  const { isLoading: isValidatingEmail, mutate: validateEmail } = useValidateEmailMutation()

  const handleCreateAccount = useCallback(() => router.push(CREATE_ACCOUNT_PAGE_PATH), [router])

  const onSubmit: SubmitHandler<SignInSchema> = useCallback(
    async ({ email, password }) => {
      try {
        setIsLoading(true)
        const response = await signIn('sign-in', { email, password, redirect: false })

        if (response?.ok) {
          await router.push(redirectTo.toString() || HOME_PAGE_PATH)
        } else {
          setError('email', {
            message: 'Invalid email or password.',
            type: 'invalid',
          })
          setError('password', {
            message: 'Invalid email or password.',
            type: 'invalid',
          })
        }
      } catch {
        setError('email', {
          message: 'Invalid email or password.',
          type: 'invalid',
        })
        setError('password', {
          message: 'Invalid email or password.',
          type: 'invalid',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [redirectTo, router, setError]
  )

  const handleProceedAsGuest = useCallback(() => {
    // router.push(GUEST_CHECKOUT_PAGE_PATH, CHECKOUT_PAGE_PATH)
    router.push(GUEST_CHECKOUT_PAGE_PATH)
  }, [router])

  const { ref: passwordFormRef, ...passwordRegister } = register('password')

  useEffect(() => {
    if (!isLoading && session?.user !== undefined) {
      router.push(HOME_PAGE_PATH)
    }
  }, [isLoading, router, session])

  if (session?.user) {
    return <></>
  }

  return (
    <>
      <NextSeo title="Sign in" />
      <main className="py-16">
        <div className="container mx-auto">
          <div className="container">
            <div
              className={clsx(
                `
                relative grid gap-12 divide-y divide-solid divide-neutral-light rounded border
                border-solid border-neutral-light bg-neutral-50 p-10 md:mx-auto
                md:max-w-6xl md:grid-cols-2 md:gap-0 md:divide-x
              `,
                fullName !== undefined && !!fullName.length && 'md:max-w-xl md:!grid-cols-1'
              )}
            >
              <LoadingOverlay visible={isSubmitting} />
              <div className={clsx('md:pr-16', fullName && 'md:!pr-0')}>
                <div className="mb-3">
                  {fullName !== undefined && !!fullName.length ? (
                    <Typography as="h4">Welcome back, {fullName}</Typography>
                  ) : (
                    <Typography as="h3" className="!m-0">
                      Returning Customers
                    </Typography>
                  )}
                </div>
                <form className="grid auto-rows-auto gap-4" onSubmit={handleSubmit(onSubmit)}>
                  <Input
                    id="email"
                    label="Email"
                    loading={isValidatingEmail}
                    type="email"
                    {...register('email', {
                      onBlur: event => {
                        const newEmail = event.target.value
                        if (newEmail.trim().length > 0) {
                          validateEmail({
                            email: newEmail.trim(),
                          })
                        }
                      },
                    })}
                  />
                  <PasswordInput
                    autoComplete="current-password"
                    error={errors.password?.message}
                    label="Password"
                    {...passwordRegister}
                    ref={passwordFormRef}
                  />
                  <div className="flex items-center justify-between pt-2">
                    <Button data-testid="signInButton" disabled={isValidatingEmail} type="submit">
                      Sign in
                    </Button>
                    <Link className="!text-neutral-dark" href="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>
                </form>
              </div>
              {!fullName && (
                <div className="space-y-3 border-x-0 pt-4 md:!border-y-0 md:border-x md:!pt-0 md:pl-16">
                  {redirectTo === CHECKOUT_PAGE_PATH && !hasSubscriptionInCart && (
                    <div className="pb-4 space-y-2">
                      <Typography as="h6">Are you ready to checkout?</Typography>
                      <Button onClick={handleProceedAsGuest}>Proceed as guest</Button>
                    </div>
                  )}
                  <Typography as="h6" className="!text-lg">
                    Create an account. Here&apos;s why you should:
                  </Typography>
                  <ul className="ml-4 list-disc">
                    <li>Keep track of your orders.</li>
                    <li>Earn rewards and credits for qualifying purchases.</li>
                    <li>Keep up to date on new products and promotions.</li>
                  </ul>
                  <Button onClick={handleCreateAccount}>Create my account</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default SignInPage
