import { useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ArrowRightIcon } from '@heroicons/react/20/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingOverlay } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { PasswordInput } from '@/core/components/password-input'
import { Typography } from '@/core/components/typogrpahy'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CreateAccountOptions, useCreateAccountMutation } from '@/lib/mutations/create-account'
import { useGuestSignInMutation } from '@/lib/mutations/guest-sign-in'
import { ValidateEmail, useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { HOME_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useConsultantStore } from '@/lib/stores/consultant'

import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from './dob/util'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

const shoppingWithConsultantSchema = z.object({
  shoppingWithConsultant: z.boolean().default(false),
})
const consultantSchema = z.object({ consultant: z.string() })
const passwordSchema = z.object({
  confirmPassword: z.string().trim().min(7, { message: 'Please confirm your password.' }),
  password: z
    .string()
    .trim()
    .min(7, { message: 'Your password must be at least 7 characters.' })
    .regex(/.*[A-Z].*/g, 'Your password must contain at least 1 uppercase letter.')
    .regex(/.*[a-z].*/g, 'Your password must contain at least 1 lowercase letter.')
    .regex(/.*\d.*/g, 'Your password must contain at least 1 number.'),
})

export const baseCreateAccountSchema = z.object({
  consultant: z.string().optional(),
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
    .min(1, { message: 'Please enter your email.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  firstName: z.string().min(1, { message: 'Please enter your first name.' }).trim(),
  lastName: z.string().min(1, { message: 'Please enter your last name.' }).trim(),
  month: z
    .string()
    .min(1, { message: 'Please enter the month.' })
    .length(2, 'Please enter the month.')
    .trim(),
  shoppingWithConsultant: z.boolean().default(false),
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

const createAccountSchema = baseCreateAccountSchema
  .merge(passwordSchema)
  .merge(shoppingWithConsultantSchema.partial())
  .merge(consultantSchema.partial())
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

    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Your passwords do not match',
        path: ['confirmPassword'],
      })
    }

    if (data.shoppingWithConsultant && !data.consultant) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a consultant.',
        path: ['consultant'],
      })
    }
  })

export type CreateAccountSchema = z.infer<typeof createAccountSchema>

export const CreateAccountForm = () => {
  const { consultant } = useConsultantStore()
  const { mutate: guestSignIn } = useGuestSignInMutation()

  const defaultValues: Partial<CreateAccountSchema> = useMemo(
    () => ({
      consultant:
        consultant.displayId !== CORPORATE_CONSULTANT_ID
          ? consultant.displayName || consultant.url
          : undefined,
      shoppingWithConsultant: consultant.displayId !== CORPORATE_CONSULTANT_ID || false,
    }),
    [consultant]
  )

  const options: UseFormProps<CreateAccountSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(createAccountSchema),
    }),
    [defaultValues]
  )
  const methods = useForm<CreateAccountSchema>(options)
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
  } = methods
  const { mutate: createAccount } = useCreateAccountMutation()
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()
  const router = useRouter()
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [fullName, setFullName] = useState('')
  const [isGuest, setIsGuest] = useState(false)
  const [passwordVisible, setPasswordVisible] = useInputState<boolean>(false)

  const onSubmit: SubmitHandler<CreateAccountSchema> = async ({
    day,
    email,
    firstName,
    lastName,
    month,
    password,
    year,
  }) => {
    setValue('consultant', consultant?.displayName)

    if (isGuest) {
      guestSignIn({
        createAccount: true,
        dateOfBirth: { day, month, year },
        email,
        firstName,
        lastName,
        password,
      })
    }

    const dateOfBirth = isGuest ? `${year}-${month}-${day}` : `${month}/${day}/${year}`
    const payload: CreateAccountOptions = {
      callback: () => {
        // ! TODO: Create user welcome page.
        router.push(HOME_PAGE_PATH)
      },
      dateOfBirth,
      email,
      firstName,
      lastName,
      password,
      redirection: HOME_PAGE_PATH,
    }

    // generateSimpleGtmEvent('GA-Create-Account-Clicked')

    // if (consultant.displayName) {
    //   generateGtmEventWithData('GA-Signed-Up-With-Consultant', {
    //     signUpConsultantname: consultant.displayName,
    //   })
    // }

    if (isGuest) {
      await router.push(HOME_PAGE_PATH)
    } else {
      createAccount(payload)
    }
  }

  const signInHref = useMemo(
    () => ({ pathname: SIGN_IN_PAGE_PATH, query: { email: getValues().email, fullName } }),
    [getValues, fullName]
  )

  return (
    <>
      <LoadingOverlay visible={isSubmitting} />
      <FormProvider {...methods}>
        <form
          className="flex flex-col md:grid md:auto-rows-auto md:grid-cols-2 md:gap-x-11 md:gap-y-4 items-start"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            noSpacing
            error={errors.firstName?.message}
            id="firstName"
            label="First name"
            {...register('firstName')}
          />
          <Input
            noSpacing
            error={errors.lastName?.message}
            id="lastName"
            label="Last name"
            {...register('lastName')}
          />
          <Input
            noSpacing
            error={errors.email?.message}
            id="email"
            label="Email"
            loading={isValidatingEmail}
            type="email"
            {...register('email', {
              onBlur: event => {
                const newEmail = event.target.value
                if (newEmail.length > 0 && !errors.email?.message) {
                  validateEmail({
                    callback: (response: ValidateEmail) => {
                      const isExisting =
                        response?.result === 1 && response?.data.customer && !response.data.guest
                      setIsExistingCustomer(isExisting)
                      setFullName(
                        response !== undefined
                          ? response.email_info?.ExistingPersons?.[0]?.PersonFullName || ''
                          : ''
                      )
                      if (isExisting) {
                        setError('email', {
                          message: 'You already have an account.',
                        })
                      } else if (response?.result === 1 && response?.data.consultant) {
                        setError('email', {
                          message: "You're a consultant.",
                        })
                      }
                      setIsGuest(response?.result === 1 && response.data.guest)
                    },
                    email: newEmail,
                  })
                }
              },
            })}
          />
          <DateOfBirthPicker noSpacing />
          {isExistingCustomer ? (
            <Link button href={signInHref}>
              Take me to sign in
              <ArrowRightIcon className="h-6 w-6" />
            </Link>
          ) : (
            <>
              <PasswordInput
                error={errors.password?.message}
                label="Password"
                visible={passwordVisible}
                onVisibilityChange={setPasswordVisible}
                {...register('password')}
              />
              <PasswordInput
                error={errors.confirmPassword?.message}
                label="Confirm password"
                visible={passwordVisible}
                onVisibilityChange={setPasswordVisible}
                {...register('confirmPassword')}
              />
              <Button className="my-4" disabled={isValidatingEmail} type="submit">
                Create my account
              </Button>
              <div className="col-span-2 flex items-center gap-1 text-neutral-900">
                Already have an account?{' '}
                <Link className="!text-neutral-dark" href={SIGN_IN_PAGE_PATH}>
                  <Typography className="inline" color="brand">
                    Sign in
                  </Typography>
                </Link>
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </>
  )
}
