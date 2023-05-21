import { FocusEventHandler, useCallback, useEffect, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsPanelProps } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { ValidateEmail, useValidateEmailMutation } from '@/lib/mutations/validate-email'

import { useCustomerQuery } from '../../queries/get-customer'

import { useUpdateCustomerMutation } from './mutations/update-customer'

const profileSchema = z.object({
  company: z.string().optional(),
  dateOfBirth: z.string(),
  email: z
    .string()
    .email('Please enter a valid email.')
    .min(1, { message: 'Please enter your email.' }),
  firstName: z.string().min(1, { message: 'Please enter your first name.' }),
  lastName: z.string().min(1, { message: 'Please enter your last name.' }),
})

type ProfileSchema = z.infer<typeof profileSchema>

export const Profile = (props: TabsPanelProps) => {
  const { data: session } = useSession()
  const { data: customer, isFetching, isLoading } = useCustomerQuery()
  const { mutate: updateCustomer } = useUpdateCustomerMutation()
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()

  const defaultValues: ProfileSchema = useMemo(
    () => ({
      company: customer?.Person_Name.CompanyName || '',
      dateOfBirth:
        customer?.Person_OtherInformation.DateOfBirth ||
        session?.user?.dateOfBirth?.toISOString() ||
        '',
      email: customer?.Person_ContactInfo.Email || session?.user?.email || '',
      firstName: customer?.Person_Name.FirstName || session?.user?.name.first || '',
      lastName: customer?.Person_Name.LastName || session?.user?.name.last || '',
    }),
    [
      customer?.Person_ContactInfo.Email,
      customer?.Person_Name.CompanyName,
      customer?.Person_Name.FirstName,
      customer?.Person_Name.LastName,
      customer?.Person_OtherInformation.DateOfBirth,
      session?.user?.dateOfBirth,
      session?.user?.email,
      session?.user?.name.first,
      session?.user?.name.last,
    ]
  )

  const formProps: UseFormProps<ProfileSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(profileSchema),
    }),
    [defaultValues]
  )

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProfileSchema>(formProps)

  useEffect(() => {
    if (!isFetching && !isLoading && customer !== undefined) {
      reset(defaultValues)
    }
  }, [customer, defaultValues, isFetching, isLoading, reset])

  const handleEmailBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    event => {
      const newEmail = event.target.value
      if (
        newEmail.length > 0 &&
        (newEmail !== session?.user?.email || newEmail !== customer?.Person_ContactInfo.Email)
      ) {
        validateEmail({
          callback: (response: ValidateEmail) => {
            const isExisting =
              response?.result === 1 && response?.data.customer && !response.data.guest
            setError('email', { message: '' })

            if (isExisting) {
              setError('email', {
                message: 'This email is already associated with another account.',
              })
            } else if (response?.result === 1 && response?.data.consultant) {
              setError('email', {
                message: `
                This email address is already in use! If you are already a Consultant and need
                help accessing your account, please reach out to our support team.
              `,
              })
            } else {
              setError('email', { message: '' })
            }
          },
          email: newEmail,
        })
      }
    },
    [customer?.Person_ContactInfo.Email, session?.user?.email, setError, validateEmail]
  )

  const onSubmit: SubmitHandler<ProfileSchema> = useCallback(
    async ({ dateOfBirth, email, firstName, lastName, company }) => {
      updateCustomer({
        companyName: company,
        currentEmail: email,
        dateOfBirth,
        email,
        firstName,
        lastName,
        mobile: '',
        optOutCompanyEmail: false,
        optOutConsultantEmail: false,
      })
    },
    [updateCustomer]
  )

  return (
    <Tabs.Panel {...props}>
      <Typography as="h4">{session?.user?.fullName}</Typography>
      <form
        className="auto-grid-rows grid lg:grid-cols-2 lg:gap-x-10"
        id="profile-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input error={errors?.firstName?.message} label="First name" {...register('firstName')} />
        <Input error={errors?.lastName?.message} label="Last name" {...register('lastName')} />
        <Input error={errors?.company?.message} label="Company" {...register('company')} />
        <Input
          error={errors?.email?.message}
          label="Email"
          loading={isValidatingEmail}
          {...register('email', { onBlur: handleEmailBlur })}
        />
        <Input
          error={errors?.dateOfBirth?.message}
          label="Date of birth"
          {...register('dateOfBirth')}
        />
      </form>
      <Button dark className="mt-10 w-full lg:w-auto" form="profile-form">
        Save my profile changes
      </Button>
    </Tabs.Panel>
  )
}
