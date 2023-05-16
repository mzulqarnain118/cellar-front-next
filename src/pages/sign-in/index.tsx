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
import { CREATE_ACCOUNT_PAGE_PATH, HOME_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { useUserStore } from '@/lib/stores/user'
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
  const {
    user: { fullName },
  } = useUserStore()

  const formOptions: UseFormProps<SignInSchema> = useMemo(
    () => ({
      defaultValues: { email: '', password: '' },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(signInSchema),
    }),
    []
  )

  const {
    formState: { errors, isSubmitting },
    getValues: _,
    handleSubmit,
    register,
    setError,
  } = useForm<SignInSchema>(formOptions)

  const [isLoading, setIsLoading] = useState(false)
  // const [showPassword, setShowPassword] = useState(false)
  // const passwordRef = useRef<HTMLInputElement | null>(null)

  const { isLoading: _isValidatingEmail, mutate: validateEmail } = useValidateEmailMutation()

  // const handleEmailBlur: FocusEventHandler<HTMLInputElement> = useCallback(() => {
  //   const { email } = getValues()
  // }, [getValues, validateEmail])

  const handleCreateAccount = useCallback(() => router.push(CREATE_ACCOUNT_PAGE_PATH), [router])

  const onSubmit: SubmitHandler<SignInSchema> = useCallback(
    async ({ email, password }) => {
      try {
        setIsLoading(true)
        const response = await signIn('sign-in', { email, password, redirect: false })

        if (response?.ok) {
          await router.push(HOME_PAGE_PATH)
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
      } catch (error) {
        // ! TODO: Handle error.
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
    [router, setError]
  )

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
    <div className="py-16">
      <NextSeo />
      <div className="container mx-auto">
        <div className="container">
          <div
            className={clsx(
              `
                relative grid gap-12 divide-y divide-solid divide-neutral-200 rounded border
                border-solid border-neutral-200 bg-neutral-50 p-10 md:mx-auto
                md:max-w-6xl md:grid-cols-2 md:gap-0 md:divide-x
              `,
              fullName !== undefined && !!fullName.length && 'md:max-w-xl md:grid-cols-1'
            )}
          >
            <LoadingOverlay visible={isSubmitting} />
            <div className={clsx('md:pr-16', fullName && 'md:pr-0')}>
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
                  // rightSection={isValidatingEmail ? <Loader size="sm" /> : undefined}
                  type="email"
                  {...register('email', {
                    onBlur: event => {
                      const newEmail = event.target.value
                      if (newEmail.trim().length > 0) {
                        validateEmail({
                          callback: _resopnse => {
                            // console.log()
                          },
                          email: newEmail.trim(),
                        })
                      }
                    },
                  })}
                />
                <PasswordInput
                  error={errors.password?.message}
                  label="Password"
                  {...passwordRegister}
                  ref={passwordFormRef}
                />
                <div className="flex items-center justify-between pt-2">
                  <Button type="submit">Sign in</Button>
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
              </form>
            </div>
            {!fullName && (
              <div className="space-y-3 border-x-0 pt-4 md:!border-y-0 md:border-x md:!pt-0 md:pl-16">
                <Typography as="h3" className="!m-0">
                  New to Scout & Cellar?
                </Typography>
                {/* {redirectTo === CHECKOUT_URL && !hasSubscriptionInCart && (
                  <div className="pb-4">
                    <h6>Are you ready to checkout?</h6>
                    <button
                      className="btn-primary btn"
                      onClick={async () => {
                        await navigate(CHECKOUT_URL, { state: { method: 'guest' } })
                      }}
                    >
                      Proceed as guest
                    </button>
                  </div>
                )} */}
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
    </div>
  )
}

export default SignInPage
