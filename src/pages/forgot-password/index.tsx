import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import Script from 'next/script'

import { zodResolver } from '@hookform/resolvers/zod'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useForgotPasswordMutation } from '@/features/forgot-password/mutations'
import { HOME_PAGE_PATH } from '@/lib/paths'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Please enter your email.' }),
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage: NextPage = () => {
  const router = useRouter()
  const [error, setError] = useState('')
  const { mutate: forgotPassword } = useForgotPasswordMutation()

  const formProps: UseFormProps<ForgotPasswordSchema> = useMemo(
    () => ({
      defaultValues: {
        email: '',
        recaptcha: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(forgotPasswordSchema),
    }),
    []
  )

  const { handleSubmit, register } = useForm<ForgotPasswordSchema>(formProps)

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = useCallback(
    async data => {
      let recaptcha = ''
      recaptcha = window.grecaptcha?.getResponse() || ''

      if (recaptcha === '') {
        setError('Recaptcha must be confirmed.')
        return
      } else {
        setError('')
      }

      forgotPassword({ email: data.email, recaptcha })
      router.push(HOME_PAGE_PATH)
    },
    [forgotPassword, router]
  )

  return (
    <>
      <NextSeo />
      <Script async defer src="https://www.google.com/recaptcha/api.js" />

      <main>
        <div className="container mx-auto">
          <div className="rounded mx-auto max-w-lg border border-neutral-light bg-neutral-50 p-4">
            <Typography as="h1" displayAs="h4">
              Forgot your password?
            </Typography>
            <Typography>Enter your email to be sent a link to reset your password.</Typography>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input label="Email" {...register('email')} />
              <div
                className="g-recaptcha"
                data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              />
              <Typography className="text-14 text-error block">{error}</Typography>
              <Button dark type="submit">
                Reset password
              </Button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default ForgotPasswordPage
