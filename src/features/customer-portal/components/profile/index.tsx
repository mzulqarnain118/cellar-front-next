import { FocusEventHandler, useCallback, useEffect, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Tabs, TabsPanelProps } from '@mantine/core'
import { isLeapYear } from 'date-fns'
import getDate from 'date-fns/getDate'
import getMonth from 'date-fns/getMonth'
import getYear from 'date-fns/getYear'
import { useSession } from 'next-auth/react'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { MAX_DAYS, MONTH_MAP, is21OrOlder } from '@/features/create-account/dob/util'
import { ValidateEmail, useValidateEmailMutation } from '@/lib/mutations/validate-email'

import { useUpdateCustomerMutation } from '../../mutations/update-customer'
import { useCustomerQuery } from '../../queries/customer'

const profileSchema = z
  .object({
    company: z.string().optional(),
    day: z
      .string()
      .min(1, { message: 'Please enter the day.' })
      .length(2, 'Please enter the day.')
      .trim()
      .refine(value => parseInt(value) <= 31, {
        message: 'The day cannot be greater than 31.',
      }),
    email: z
      .string()
      .email('Please enter a valid email.')
      .min(1, { message: 'Please enter your email.' }),
    firstName: z.string().min(1, { message: 'Please enter your first name.' }),
    lastName: z.string().min(1, { message: 'Please enter your last name.' }),
    mobileNumber: z.string().min(1, { message: 'Please enter your mobile number.' }),
    month: z
      .string()
      .min(1, { message: 'Please enter the month.' })
      .length(2, 'Please enter the month.')
      .trim(),
    phoneNumber: z.string().min(1, { message: 'Please enter your phone number.' }),
    year: z
      .string()
      .min(1, { message: 'Please enter the year.' })
      .length(4, 'Please enter the year.')
      .trim()
      .refine(
        value => {
          const thisYear = new Date().getFullYear()
          const maximumYear = thisYear - 21
          const minimumYear = thisYear - 100
          const enteredYear = parseInt(value)

          return enteredYear >= minimumYear && enteredYear <= maximumYear
        },
        { message: 'You must be 21 or older to create an account.' }
      ),
  })
  .superRefine((data, context) => {
    const isFebruary = data.month === '02'
    const month = parseInt(data.month)
    const day = parseInt(data.day)
    const year = parseInt(data.year)
    const isValidDate =
      !isNaN(parseInt(data.month)) && !isNaN(parseInt(data.day)) && !isNaN(parseInt(data.year))

    if (!is21OrOlder(year, month, day)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be 21 or older to create an account.',
        path: ['year'],
      })
    }

    if (isFebruary && isLeapYear(year)) {
      MAX_DAYS['02'] = 29
    }

    const maxDays = MAX_DAYS[data.month]
    if (parseInt(data.day) > maxDays && isValidDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `There are only ${maxDays} days in ${MONTH_MAP[data.month]} ${year}.`,
        path: ['day'],
      })
    }
  })

type ProfileSchema = z.infer<typeof profileSchema>

const PHONE_TYPE_ID = 1
const MOBILE_TYPE_ID = 3

export const Profile = (props: TabsPanelProps) => {
  const { data: session } = useSession()
  const { data: customer, isFetching, isLoading } = useCustomerQuery()
  const { mutate: updateCustomer } = useUpdateCustomerMutation()
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()

  const [phoneNumber, mobileNumber] = useMemo(() => {
    if (
      !customer ||
      !customer.Person_ContactInfo ||
      !Array.isArray(customer.Person_ContactInfo.Person_Phones)
    )
      return ['', '']

    const removeFirstOne = (phoneNum: string) => {
      const phoneRegEx = new RegExp('^1[0-9]{10}$')
      return phoneRegEx.test(phoneNum) ? phoneNum.replace(/^1/, '') : phoneNum
    }

    return [
      removeFirstOne(
        (customer.Person_ContactInfo.Person_Phones.find(p => p.PhoneTypeID === PHONE_TYPE_ID) || {})
          .PhoneNumber || ''
      ),
      removeFirstOne(
        (
          customer.Person_ContactInfo.Person_Phones.find(p => p.PhoneTypeID === MOBILE_TYPE_ID) ||
          {}
        ).PhoneNumber || ''
      ),
    ]
  }, [customer])

  const defaultBirthday = useMemo(() => {
    const dateOfBirth =
      customer?.Person_OtherInformation.DateOfBirth ||
      session?.user?.dateOfBirth?.toISOString() ||
      ''
    const birthday = new Date(dateOfBirth)
    const month = getMonth(birthday)

    return {
      day: getDate(birthday).toString(),
      month: `${month < 10 ? `0${month + 1}` : month + 1}`,
      year: getYear(birthday).toString(),
    }
  }, [customer?.Person_OtherInformation.DateOfBirth, session?.user?.dateOfBirth])

  const defaultValues: ProfileSchema = useMemo(
    () => ({
      ...defaultBirthday,
      company: customer?.Person_Name.CompanyName || '',
      email: customer?.Person_ContactInfo.Email || session?.user?.email || '',
      firstName: customer?.Person_Name.FirstName || session?.user?.name.first || '',
      lastName: customer?.Person_Name.LastName || session?.user?.name.last || '',
      mobileNumber,
      phoneNumber,
    }),
    [
      customer?.Person_ContactInfo.Email,
      customer?.Person_Name.CompanyName,
      customer?.Person_Name.FirstName,
      customer?.Person_Name.LastName,
      defaultBirthday,
      mobileNumber,
      phoneNumber,
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

  const methods = useForm<ProfileSchema>(formProps)

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = methods

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
    async ({
      company,
      day,
      email,
      firstName,
      lastName,
      mobileNumber: mobile,
      month,
      phoneNumber,
      year,
    }) => {
      const dateOfBirth = new Date(parseInt(year), parseInt(month), parseInt(day)).toISOString()

      updateCustomer({
        companyName: company,
        currentEmail: email,
        dateOfBirth,
        email,
        firstName,
        lastName,
        mobile,
        optOutCompanyEmail: false,
        optOutConsultantEmail: false,
        phoneNumber,
      })
    },
    [updateCustomer]
  )

  return (
    <Tabs.Panel {...props}>
      <Typography as="h4">{session?.user?.fullName}</Typography>
      <FormProvider {...methods}>
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
            type="email"
            {...register('email', { onBlur: handleEmailBlur })}
          />
          <Input
            error={errors?.phoneNumber?.message}
            inputMode="numeric"
            label="Phone number"
            {...register('phoneNumber')}
          />
          <Input
            error={errors?.mobileNumber?.message}
            inputMode="numeric"
            label="Mobile number"
            {...register('mobileNumber')}
          />
          <DateOfBirthPicker />
        </form>
        <Button dark className="mt-10 w-full lg:w-auto" form="profile-form">
          Save my profile changes
        </Button>
      </FormProvider>
    </Tabs.Panel>
  )
}
