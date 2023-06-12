import { useCallback, useMemo } from 'react'

import { Select } from '@mantine/core'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/form'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Textarea } from '@/core/components/textarea'
import { Typography } from '@/core/components/typogrpahy'

const contactForm = z.object({
  body: z.string().min(1, { message: 'Please enter a message.' }),
  consultantName: z.string().optional(),
  email: z
    .string()
    .email('Please enter your email.')
    .min(1, { message: 'Please enter your email.' }),
  fullName: z.string().min(1, { message: 'Please enter your full name.' }),
  orderNumber: z.string().optional(),
  phoneNumber: z.string().min(1, { message: 'Please enter your phone number.' }),
  reason: z.string().min(1, { message: 'Please select a reason.' }),
  subject: z.string().min(1, { message: 'Please select a subject.' }),
})

type ContactFormSchema = z.infer<typeof contactForm>

export const ContactForm = () => {
  const defaultValues: ContactFormSchema = useMemo(
    () => ({
      body: '',
      consultantName: '',
      email: '',
      fullName: '',
      orderNumber: '',
      phoneNumber: '',
      reason: '',
      subject: '',
    }),
    []
  )

  const handleSubmit: SubmitHandler<ContactFormSchema> = useCallback(async _values => {
    //
  }, [])

  const temporaryData = useMemo(() => [], [])

  return (
    <div className="border rounded bg-neutral-50 p-6 border-neutral-light">
      <Typography as="h5" className="text-center">
        Contact us
      </Typography>
      <Form
        className="grid lg:grid-cols-2 lg:gap-x-10 items-start"
        defaultValues={defaultValues}
        schema={contactForm}
        onSubmit={handleSubmit}
      >
        <Input label="Full name" name="fullName" />
        <Input label="Email" name="email" type="email" />
        <Input label="Phone number" name="phoneNumber" type="tel" />
        <Input instructionLabel="optional" label="Order number" name="orderNumber" type="tel" />
        <Input
          className="lg:col-span-2"
          instructionLabel="optional"
          label="Consultant name"
          name="consultantName"
        />
        <Select data={temporaryData} label="Subject" size="md" />
        <Select data={temporaryData} label="Reason" size="md" />
        <Textarea className="lg:col-span-2" label="How can we help you?" name="body" />
        <Button dark className="col-span-2 lg:col-span-1 mt-4" type="submit">
          Send message
        </Button>
      </Form>
    </div>
  )
}
