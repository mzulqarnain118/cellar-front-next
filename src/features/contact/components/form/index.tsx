import { useCallback, useMemo } from 'react'

import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileInput, FileInputProps, Select } from '@mantine/core'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Textarea } from '@/core/components/textarea'
import { Typography } from '@/core/components/typogrpahy'

const classNames: FileInputProps['classNames'] = {
  input: 'bg-base-light',
}

const icon = <ArrowUpOnSquareIcon className="h-5 w-5 stroke-neutral-dark" />

const FILE_TYPES = [
  'image/png',
  'image/jpeg',
  '.doc',
  '.docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf',
  '.txt',
]

const subjectReasonMap: Record<string, string[]> = {
  'Account Inquiry': [
    'Login Help',
    'Technical Inquiry',
    'Business Related Questions',
    'Scout Circle Membership',
    'Tasting Inquiries',
  ],
  'General Inquiry': ['General Inquiry', 'HR Requests'],
  'Order Inquiry': [
    'Alabama Order',
    'Order Status/Tracking',
    'Satisfaction Guarantee',
    'Local Pick-Up',
    'Cancel an Order',
    'Host Order',
    'Group Gifting Submission',
  ],
  'Product Inquiry': ['Wine', 'Merch', 'Nutritional Information'],
}

const contactForm = z.object({
  attachment: z.custom<File>().optional(),
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

  const formProps: UseFormProps<ContactFormSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(contactForm),
    }),
    [defaultValues]
  )

  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<ContactFormSchema>(formProps)

  const temporaryData = useMemo(() => [], [])

  const handleAttachmentChange: FileInputProps['onChange'] = useCallback(
    (file: File | null) => {
      if (!file) {
        clearErrors('attachment')
        return
      }

      if (!FILE_TYPES.includes(file.type)) {
        // Invalid file type.
        setError('attachment', {
          message: 'Only .png, .jpeg, .txt, .pdf, .doc, and .docx are acceptable file types.',
        })
        return
      }

      const sizeInMb = parseInt((file.size / 1048576).toFixed(1))
      if (sizeInMb > 10) {
        // File too big.
        setError('attachment', { message: 'The file cannot exceed 10 MB.' })
        return
      }

      clearErrors('attachment')
    },
    [clearErrors, setError]
  )

  const onSubmit: SubmitHandler<ContactFormSchema> = useCallback(
    async ({
      attachment,
      body,
      consultantName,
      email,
      fullName,
      phoneNumber,
      orderNumber,
      reason,
      subject,
    }) => {
      const formData = new FormData()
      if (attachment !== undefined) {
        formData.set('attachment', attachment)
      }
      if (orderNumber !== undefined) {
        formData.set('orderNumber', orderNumber)
      }
      if (consultantName !== undefined) {
        formData.set('consultantName', consultantName)
      }
      formData.set('body', body)
      formData.set('email', email)
      formData.set('fullName', fullName)
      formData.set('phoneNumber', phoneNumber)
      formData.set('reason', reason)
      formData.set('subject', subject)
    },
    []
  )

  return (
    <div className="border rounded bg-neutral-50 p-6 border-neutral-light">
      <Typography as="h5" className="text-center">
        Contact us
      </Typography>
      <form
        className="grid lg:grid-cols-2 lg:gap-x-10 items-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input error={errors.fullName?.message} label="Full name" {...register('fullName')} />
        <Input error={errors.email?.message} label="Email" type="email" {...register('email')} />
        <Input
          error={errors.phoneNumber?.message}
          label="Phone number"
          type="tel"
          {...register('phoneNumber')}
        />
        <Input
          error={errors.orderNumber?.message}
          instructionLabel="optional"
          label="Order number"
          type="tel"
          {...register('orderNumber')}
        />
        <Input
          className="lg:col-span-2"
          error={errors.consultantName?.message}
          instructionLabel="optional"
          label="Consultant name"
          {...register('consultantName')}
        />
        <Select
          data={temporaryData}
          error={errors.subject?.message}
          label="Subject"
          name="subject"
          size="md"
        />
        <Select data={temporaryData} error={errors.reason?.message} label="Reason" size="md" />
        <Textarea
          className="lg:col-span-2"
          error={errors.body?.message}
          label="How can we help you?"
          {...register('body')}
        />
        <FileInput
          clearable
          accept={FILE_TYPES.join(',')}
          className="col-span-1"
          classNames={classNames}
          description="Optional"
          error={errors.attachment?.message}
          icon={icon}
          label="Attachment"
          size="md"
          onChange={handleAttachmentChange}
        />
        <div className="col-span-1" />
        <Button dark className="col-span-2 lg:col-span-1 mt-4" type="submit">
          Send message
        </Button>
      </form>
    </div>
  )
}
