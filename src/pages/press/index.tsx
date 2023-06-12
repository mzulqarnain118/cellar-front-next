import { useCallback, useMemo } from 'react'

import { NextSeo } from 'next-seo'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/form'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Textarea } from '@/core/components/textarea'
import { Typography } from '@/core/components/typogrpahy'

const press = z.object({
  body: z.string().min(1, { message: 'Please enter a message.' }),
  companyName: z.string().min(1, { message: 'Please enter your company name.' }),
  email: z
    .string()
    .email('Please enter your email.')
    .min(1, { message: 'Please enter your email.' }),
  name: z.string().min(1, { message: 'Please enter your name.' }),
  phoneNumber: z.string().min(1, { message: 'Please enter your phone number.' }),
  subject: z.string().min(1, { message: 'Please enter the subject.' }),
})

type PressSchema = z.infer<typeof press>

const PressPage = () => {
  const defaultValues: PressSchema = useMemo(
    () => ({
      body: '',
      companyName: '',
      email: '',
      name: '',
      phoneNumber: '',
      subject: '',
    }),
    []
  )

  const handleSubmit: SubmitHandler<PressSchema> = useCallback(async _data => {
    //
  }, [])

  return (
    <>
      <NextSeo description="" title="Press Inquiries" />
      <main>
        <div className="container mx-auto flex items-center justify-center my-10">
          <div className="text-center rounded border p-6 w-[768px] bg-neutral-50 border-neutral-light">
            <Typography as="h1" className="mb-2" displayAs="h3">
              Press inquiries
            </Typography>
            <Typography as="h2" displayAs="h6">
              Please fill in your request info below
            </Typography>
            <Form
              className="text-left grid lg:grid-cols-2 lg:gap-x-10"
              defaultValues={defaultValues}
              schema={press}
              onSubmit={handleSubmit}
            >
              <Input label="Company name" name="companyName" />
              <Input label="Name" name="name" />
              <Input label="Phone number" name="phoneNumber" type="tel" />
              <Input label="Email" name="email" type="email" />
              <Input className="lg:col-span-2" label="Subject" name="subject" />
              <Textarea className="lg:col-span-2" label="How can we help you?" name="body" />
              {/* TODO: Attachments */}
              <Button dark className="mt-4" type="submit">
                Send message
              </Button>
            </Form>
          </div>
        </div>
      </main>
    </>
  )
}

export default PressPage
