import { useCallback, useMemo, useState } from 'react'

import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { ReCAPTCHA } from 'react-google-recaptcha'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/form'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Please enter your email.' }),
  recaptcha: z.string().min(1, { message: 'Please validate the captcha.' }),
})

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage: NextPage = () => {
  const [_recaptcha, setRecaptcha] = useState('')

  const defaultValues: ForgotPasswordSchema = useMemo(
    () => ({
      email: '',
      recaptcha: '',
    }),
    []
  )

  const handleRecaptchaChange = useCallback((value: string | null) => {
    if (value) {
      setRecaptcha(value)
    }
  }, [])

  const handleSubmit: SubmitHandler<ForgotPasswordSchema> = useCallback(async _data => {
    // ! TODO
  }, [])

  return (
    <>
      <NextSeo />

      <main>
        <div className="container mx-auto">
          <div className="rounded mx-auto max-w-lg border border-neutral-light bg-neutral-50 p-4">
            <Typography as="h1" displayAs="h4">
              Forgot your password?
            </Typography>
            <Typography>Enter your email to be sent a link to reset your password.</Typography>
            <Form
              className=""
              defaultValues={defaultValues}
              schema={forgotPasswordSchema}
              onSubmit={handleSubmit}
            >
              <Input label="Email" name="email" />
              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== undefined ? (
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                />
              ) : undefined}
            </Form>
          </div>
        </div>
      </main>
    </>
  )
}

export default ForgotPasswordPage
