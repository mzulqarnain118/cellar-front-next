import { ChangeEvent, useCallback, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { ArrowRightIcon } from '@heroicons/react/20/solid'
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useCreateAccountMutation } from '@/lib/mutations/create-account'
import { useGuestSignInMutation } from '@/lib/mutations/guest-sign-in'
import { ValidateEmail, useValidateEmailMutation } from '@/lib/mutations/validate-email'
import {
  CREATE_ACCOUNT_PAGE_PATH,
  FORGOT_PASSWORD_PAGE_PATH,
  HOME_PAGE_PATH,
  SIGN_IN_PAGE_PATH,
} from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ConsultantCheckbox } from './consultant/checkbox'
import { Day } from './dob/day'
import { Month } from './dob/month'
import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from './dob/util'
import { Year } from './dob/year'

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
  receivePromoMessages: z.boolean().default(false),
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
  const { data: cart } = useCartQuery()
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
      reValidateMode: 'onBlur',
      resolver: zodResolver(createAccountSchema),
    }),
    [defaultValues]
  )
  const methods = useForm<CreateAccountSchema>(options)
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setFocus,
    setValue,
    watch,
  } = methods
  const watchPassword = watch('password')
  const { mutate: createAccount } = useCreateAccountMutation()
  const { mutate: validateEmail } = useValidateEmailMutation()
  const router = useRouter()
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [fullName, setFullName] = useState('')
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit: SubmitHandler<CreateAccountSchema> = async ({
    day,
    email,
    firstName,
    lastName,
    month,
    password,
    year,
  }) => {
    try {
      setIsLoading(true)
      setValue('consultant', consultant?.displayName)

      if (isGuest) {
        guestSignIn({
          cartId: cart?.id || '',
          createAccount: true,
          dateOfBirth: { day, month, year },
          email,
          firstName,
          lastName,
          password,
        })
      }

      const dateOfBirth = isGuest ? `${year}-${month}-${day}` : `${month}/${day}/${year}`
      const payload = {
        dateOfBirth,
        email,
        firstName,
        isGuest,
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

        if (
          payload.redirection !== undefined &&
          payload.redirection !== SIGN_IN_PAGE_PATH &&
          payload.redirection !== CREATE_ACCOUNT_PAGE_PATH &&
          payload.redirection !== FORGOT_PASSWORD_PAGE_PATH
        ) {
          router.push(payload.redirection)
        } else {
          router.push(HOME_PAGE_PATH)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const emailRegister = register('email')

  const handleEmailBlur = useCallback<(e: ChangeEvent) => Promise<void>>(
    async event => {
      await emailRegister.onBlur(event)

      try {
        setIsValidatingEmail(true)
        const newEmail = getValues().email
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
            cartId: cart?.id || '',
            email: newEmail,
            sponsorId: consultant?.displayId || CORPORATE_CONSULTANT_ID,
          })
        }
      } finally {
        setIsValidatingEmail(false)
      }
    },
    [
      cart?.id,
      consultant?.displayId,
      emailRegister,
      errors.email?.message,
      getValues,
      setError,
      validateEmail,
    ]
  )

  const dobError = errors.month?.message || errors.day?.message || errors.year?.message

  const signInHref = useMemo(
    () => ({ pathname: SIGN_IN_PAGE_PATH, query: { email: getValues().email, fullName } }),
    [getValues, fullName]
  )

  return (
    <>
      <FormProvider {...methods}>
        <form
          className="flex flex-col md:grid md:auto-rows-auto md:grid-cols-2 md:gap-x-11"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="m-0" htmlFor="firstName">
              First Name
            </label>
            <input
              className={clsx(
                `
                  h-10 w-full rounded-lg border border-neutral-300
                  bg-neutral-100 px-3 outline-brand-300 transition-all
                  duration-500 placeholder:text-neutral-700 focus:!outline
                  focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                `,
                errors.firstName?.message && '!border-red-700 focus:!outline-red-700'
              )}
              id="firstName"
              type="firstName"
              {...register('firstName')}
            />
            <div
              className={clsx(
                'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                errors.firstName?.message && '!max-h-12 opacity-100'
              )}
            >
              <span className="text-red-700">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <span className="text-red-700">{errors.firstName?.message}</span>
            </div>
          </div>
          <div>
            <label className="m-0" htmlFor="lastName">
              Last Name
            </label>
            <input
              className={clsx(
                `
                  h-10 w-full rounded-lg border border-neutral-300
                  bg-neutral-100 px-3 outline-brand-300 transition-all
                  duration-500 placeholder:text-neutral-700 focus:!outline
                  focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                `,
                errors.lastName?.message && '!border-red-700 focus:!outline-red-700'
              )}
              id="lastName"
              type="text"
              {...register('lastName')}
            />
            <div
              className={clsx(
                'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                errors.lastName?.message && '!max-h-12 opacity-100'
              )}
            >
              <span className="text-red-700">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <span className="text-red-700">{errors.lastName?.message}</span>
            </div>
          </div>
          <div>
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
                errors.email?.message && '!border-red-700 focus:!outline-red-700'
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
              <span className="text-red-700">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <span className="text-red-700">{errors.email?.message}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="m-0" htmlFor="month">
                Date of Birth
              </label>
              <div
                className="tooltip tooltip-left  z-20"
                data-tip="We need your date of birth to confirm that you are at least 21 years old."
              >
                <button className="p-0">
                  <InformationCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div
              className={clsx(
                `
                  grid grid-cols-5 items-center justify-between rounded-lg border
                  border-[#BDBDBD] bg-[#EFEFEF] transition-all
                `,
                !!dobError && '!border-red-700'
              )}
            >
              <Month<CreateAccountSchema> control={control} name="month" setFocus={setFocus} />
              <Day<CreateAccountSchema> control={control} name="day" setFocus={setFocus} />
              <Year<CreateAccountSchema> control={control} name="year" setFocus={setFocus} />
            </div>
            <div
              className={clsx(
                'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                dobError && '!max-h-12 opacity-100'
              )}
            >
              <span className="text-red-700">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
              <span className="text-red-700">{dobError}</span>
            </div>
          </div>
          {isExistingCustomer ? (
            <Link
              className={`
                btn-primary btn mb-4 inline-flex items-center gap-1 no-underline transition-all
                hover:gap-2 hover:no-underline
              `}
              href={signInHref}
            >
              Take me to sign in
              <ArrowRightIcon className="h-6 w-6" />
            </Link>
          ) : (
            <>
              <div>
                <label className="m-0" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className={clsx(
                      `
                        h-10 w-full rounded-lg border border-neutral-300
                        bg-neutral-100 px-3 outline-brand-300 transition-all
                        duration-500 placeholder:text-neutral-700 focus:!outline
                        focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                      `,
                      errors.password?.message && '!border-red-700 focus:!outline-red-700'
                    )}
                    id="password"
                    type={showPassword ? 'type' : 'password'}
                    {...register('password')}
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
                    (errors.password?.message || errors.confirmPassword?.message) &&
                      '!max-h-12 opacity-100'
                  )}
                >
                  <span className="text-red-700">
                    {errors.password?.message || errors.confirmPassword?.message ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : undefined}
                  </span>

                  <span className="text-red-700">
                    {errors.password?.message || errors.confirmPassword?.message}
                  </span>
                </div>
              </div>
              <div>
                <label className="m-0" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className={clsx(
                      `
                        h-10 w-full rounded-lg border border-neutral-300
                        bg-neutral-100 px-3 outline-brand-300 transition-all
                        duration-500 placeholder:text-neutral-700 focus:!outline
                        focus:outline-1 focus:outline-offset-0 focus:outline-brand-300
                      `,
                      errors.confirmPassword?.message && '!border-red-700 focus:!outline-red-700'
                    )}
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      validate: (value: string) => {
                        if (value !== watchPassword) {
                          return 'Your passwords do not match.'
                        }
                      },
                    })}
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
                    errors.confirmPassword?.message && '!max-h-12 opacity-100'
                  )}
                >
                  <span className="text-red-700">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </span>
                  <span className="text-red-700">{errors.confirmPassword?.message}</span>
                </div>
              </div>
              <div className="col-span-2 grid">
                <ConsultantCheckbox isChecked={!!defaultValues.shoppingWithConsultant} />
              </div>
              <div className="col-span-2 grid grid-cols-[1rem_auto] items-center gap-2 pb-3">
                <input
                  aria-describedby="receivePromoMessages"
                  className="checkbox-primary checkbox checkbox-xs rounded"
                  id="receivePromoMessages"
                  type="checkbox"
                  {...register('receivePromoMessages')}
                />
                <label
                  className="z-20 mb-0 cursor-pointer font-medium text-gray-900 md:ml-2"
                  htmlFor="receivePromoMessages"
                >
                  Yes, I would like to receive promotional marketing messages.
                </label>
              </div>
              <div
                className={`
                  col-span-2 flex flex-col items-center justify-between gap-4 pt-2 pb-3 md:flex-row
                  md:gap-0
                `}
              >
                <button
                  className="btn-primary btn z-10"
                  disabled={isValidatingEmail || isLoading || !!errors.email}
                  type="submit"
                >
                  Create my account
                </button>
              </div>
              <div className="col-span-2">
                Already have an account?{' '}
                <Link className="btn-link btn p-0 text-base" href={SIGN_IN_PAGE_PATH}>
                  Sign in
                </Link>
                .
              </div>
            </>
          )}
        </form>
      </FormProvider>
    </>
  )
}
