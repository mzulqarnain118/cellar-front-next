import { useCallback, useEffect, useMemo, useState } from 'react'

import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileInputProps, Select } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Textarea } from '@/core/components/textarea'
import { Typography } from '@/core/components/typogrpahy'
import { api } from '@/lib/api'
import { toastError, toastSuccess } from '@/lib/utils/notifications'

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

  const [selectedSubject, setSelectedSubject] = useInputState('')
  const [reasonOptions, setReasonOptions] = useState([])
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)

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
    unregister,
    setError,
    getValues,
    setValue,
    reset,
    watch,
  } = useForm<ContactFormSchema>(formProps)

  const subjectWatch = watch('subject')

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

  const onSubmit: SubmitHandler<ContactFormSchema> = async ({
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
    console.log(
      attachment,
      body,
      consultantName,
      email,
      fullName,
      phoneNumber,
      orderNumber,
      reason,
      subject
    )
    console.log('🚀 ~ ContactForm ~ attachment:', attachment)

    const formData = new FormData()
    if (attachment !== undefined) {
      formData.set('attachment', file)
    }

    if (orderNumber !== undefined || orderNumber !== '') {
      formData.set('ordernumber', orderNumber)
    }
    if (consultantName !== undefined || consultantName !== '') {
      formData.set('consultantname', consultantName)
    }
    formData.set('howcanwehelpyou', body)
    formData.set('emailaddress', email)
    formData.set('fullname', fullName)
    formData.set('phonenumber', phoneNumber)
    formData.set('reason', reason)
    formData.set('subject', subject)

    const payload = {
      attachment,
      ordernumber: orderNumber,
      consultantname: consultantName,
      howcanwehelpyou: body,
      emailaddress: email,
      fullname: fullName,
      phonenumber: phoneNumber,
      reason,
      subject,
    }

    console.log('formData: ', formData)

    try {
      for (const key of formData?.entries()) {
        console.log(key[0] + ', ' + key[1])
      }
      const response = await api('v2/ContactUs', { body: formData, method: 'post' }).json()
      console.log('🚀 ~ ContactForm ~ response:', response)

      if (response?.Success) {
        toastSuccess({ message: response?.Data || 'Email sent successfully' })
        setSelectedReason('')
        setSelectedSubject('')
        setValue('reason', '')
        setValue('subject', '')
        reset()
      } else {
        toastError('error', response?.Error?.Message)
      }
    } catch {
      toastError('error', 'There was an error updating the contact us form.')
    }
  }

  useEffect(() => {
    if (selectedSubject && subjectReasonMap[selectedSubject]) {
      setReasonOptions(
        subjectReasonMap[selectedSubject].map(reason => ({
          value: reason,
          label: reason,
        }))
      )
      setSelectedReason('') // Clear selected reason when subject changes
    } else {
      setReasonOptions([])
      setSelectedReason('')
    }
  }, [selectedSubject, subjectWatch])

  const reasonSelect = useMemo(
    () => (
      <Select
        className="mt-[1rem] md:col-span-1 col-span-2"
        data={reasonOptions}
        error={errors.reason?.message}
        label="Reason"
        size="md"
        value={selectedReason}
        {...register('reason')}
        onChange={value => {
          setValue('reason', value)
          setSelectedReason(value)
        }}
      />
    ),
    [selectedSubject, selectedReason, reasonOptions]
  )

  return (
    <div className="border rounded bg-neutral-50 p-6 border-neutral-light">
      <Typography as="h5" className="text-center">
        Contact us
      </Typography>
      <form
        className="grid md:grid-cols-2 md:gap-x-10 gap-x-6 items-start "
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          error={errors.fullName?.message}
          label="Full name"
          {...register('fullName')}
          className="md:col-span-1 col-span-2"
        />
        <Input
          error={errors.email?.message}
          label="Email"
          type="email"
          {...register('email')}
          className="md:col-span-1 col-span-2"
        />
        <Input
          error={errors.phoneNumber?.message}
          label="Phone number"
          type="tel"
          maxLength={10}
          {...register('phoneNumber')}
          className="md:col-span-1 col-span-2"
        />
        <Input
          error={errors.orderNumber?.message}
          instructionLabel="optional"
          label="Order number"
          type="tel"
          {...register('orderNumber')}
          className="md:col-span-1 col-span-2"
        />
        <Input
          className="w-[100%] md:col-span-1 col-span-2"
          error={errors.consultantName?.message}
          instructionLabel="optional"
          label="Consultant name"
          {...register('consultantName')}
        />
        <Select
          className="mt-[1rem] md:col-span-1 col-span-2"
          data={[
            { value: 'Account Inquiry', label: 'Account Inquiry' },
            { value: 'General Inquiry', label: 'General Inquiry' },
            { value: 'Order Inquiry', label: 'Order Inquiry' },
            { value: 'Product Inquiry', label: 'Product Inquiry' },
          ]}
          error={errors.subject?.message}
          label="Subject"
          size="md"
          onChange={value => {
            setValue('subject', value)
            setSelectedSubject(value)
            setSelectedReason('')
          }}
        />
        {reasonSelect}
        {/* <Select
          data={reasonOptions}
          disabled={!selectedSubject}
          error={errors.reason?.message}
          label="Reason"
          name="reason"
          size="md"
          onChange={value => {
            setValue('reason', value)
            setSelectedReason(value)
          }}
        /> */}
        <Textarea
          className="md:col-span-1 col-span-2 mt-[1rem]"
          error={errors.body?.message}
          label="How can we help you?"
          {...register('body')}
          noSpacing
        />
        {/* <FileInput
          clearable
          accept={FILE_TYPES.join(',')}
          className="col-span-1"
          classNames={classNames}
          description="Optional"
          error={errors.attachment?.message}
          icon={icon}
          label="Attachment"
          name="attachment"
          size="md"
          onChange={handleAttachmentChange}
        /> */}
        <Button dark className="col-span-2 m-auto mt-4" type="submit">
          Send message
        </Button>
      </form>
    </div>
  )
}
