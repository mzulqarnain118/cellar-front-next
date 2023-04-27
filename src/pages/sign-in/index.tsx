import { FocusEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ExclamationTriangleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mantine/core'
import { dehydrate } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { signIn, useSession } from 'next-auth/react'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { getStaticNavigation } from '@/lib/queries/header'
import { useUserStore } from '@/lib/stores/user'

import { createClient } from 'prismic-io'

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
      resolver: zodResolver(signInSchema),
    }),
    []
  )

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
  } = useForm<SignInSchema>(formOptions)

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const { isLoading: isValidatingEmail, mutate: validateEmail } = useValidateEmailMutation()

  const handleEmailBlur: FocusEventHandler<HTMLInputElement> = useCallback(() => {
    const { email } = getValues()
    if (email.trim().length > 0) {
      validateEmail({
        callback: _resopnse => {
          // console.log()
        },
        email,
      })
    }
  }, [getValues, validateEmail])

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

  const emailRegister = register('email')
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
      <NextSeo />
      <div className="container mx-auto">
        <div className="container">
          <div
            className={clsx(
              `
                my-16 grid gap-12 divide-y divide-solid divide-neutral-200 rounded-lg border
                border-neutral-300 bg-neutral-50 p-10 md:mx-auto md:max-w-6xl
                md:grid-cols-2 md:gap-0 md:divide-x
              `,
              fullName !== undefined && !!fullName.length && 'md:max-w-xl md:grid-cols-1'
            )}
          >
            <div className={clsx('md:pr-16', fullName && 'md:pr-0')}>
              <div className="mb-3">
                {fullName !== undefined && !!fullName.length ? (
                  <h4>Welcome back, {fullName}</h4>
                ) : (
                  <h3>Returning Customers</h3>
                )}
              </div>
              <form className="grid auto-rows-auto" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid">
                  <label className="m-0" htmlFor="email">
                    Email
                  </label>
                  <input
                    className={clsx(
                      `
                        h-10 w-full rounded-lg border border-neutral-300
                        bg-neutral-100 px-3 outline-brand-300 transition-all
                        duration-500 placeholder:text-neutral-700 focus:!outline
                        focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                      `,
                      errors.email?.message && '!border-error focus:!outline-error'
                    )}
                    id="email"
                    type="email"
                    {...emailRegister}
                    onBlur={handleEmailBlur}
                  />
                  <div
                    className={clsx(
                      'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                      errors.email?.message && '!max-h-12 opacity-100'
                    )}
                  >
                    <span className="text-error">
                      {errors.email?.message ? (
                        <ExclamationTriangleIcon className="h-6 w-6" />
                      ) : undefined}
                    </span>
                    <span className="text-error">{errors.email?.message}</span>
                  </div>
                </div>
                <div className="grid">
                  <label className="m-0" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className={clsx(
                        `
                          z-10 h-10 w-full rounded-lg border border-neutral-300
                          bg-neutral-100 px-3 outline-brand-300 transition-all
                          duration-500 placeholder:text-neutral-700 focus:!outline
                          focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                        `,
                        errors.password?.message && '!border-error focus:!outline-error'
                      )}
                      id="password"
                      type={showPassword ? 'type' : 'password'}
                      {...passwordRegister}
                      ref={e => {
                        passwordFormRef(e)
                        passwordRef.current = e
                      }}
                    />
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className={`
                        absolute right-4 top-[20%] h-6 w-6 border-0 bg-transparent p-0
                        text-neutral-600
                      `}
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-6 w-6" />
                      ) : (
                        <EyeIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  <div
                    className={clsx(
                      'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                      errors.password?.message && '!max-h-12 opacity-100'
                    )}
                  >
                    <span className="text-error">
                      {errors.password?.message ? (
                        <ExclamationTriangleIcon className="h-6 w-6" />
                      ) : undefined}
                    </span>
                    <span className="text-error">{errors.password?.message}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button disabled={isValidatingEmail || isLoading} type="submit">
                    Sign in
                  </Button>
                  <Link className="btn-link btn" href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              </form>
            </div>
            {!fullName && (
              <div className="space-y-3 border-x-0 pt-4 md:border-x md:!border-y-0 md:!pt-0 md:pl-16">
                <h3>New to Scout & Cellar?</h3>
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
                <h6>Create an account. Here&apos;s why you should:</h6>
                <ul className="ml-4 list-disc">
                  <li>Keep track of your orders.</li>
                  <li>Earn rewards and credits for qualifying purchases.</li>
                  <li>Keep up to date on new products and promotions.</li>
                </ul>
                <Link className="btn-primary btn" href="/create-account">
                  Create my account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SignInPage
