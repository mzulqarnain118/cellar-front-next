import { ChangeEvent, useCallback, useMemo, useState } from 'react'

import { NextSeo } from 'next-seo'

import dynamic from 'next/dynamic'

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mantine/core'
import { clsx } from 'clsx'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ConsultantCheckbox } from '../create-account/consultant/checkbox'
import { Day } from '../create-account/dob/day'
import { Month } from '../create-account/dob/month'
import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from '../create-account/dob/util'
import { Year } from '../create-account/dob/year'
import { baseCreateAccountSchema } from '../create-account/form'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

const guestCheckoutSchema = baseCreateAccountSchema.superRefine((data, context) => {
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

export type GuestCheckoutSchema = z.infer<typeof guestCheckoutSchema>

export const GuestCheckout = () => {
  const [_isExistingGuest, setIsExistingGuest] = useState(false)
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [fullName, setFullName] = useState('')
  const { mutate: validateEmail } = useValidateEmailMutation()
  const { consultant } = useConsultantStore()

  const defaultValues: Partial<GuestCheckoutSchema> = useMemo(
    () => ({
      consultant:
        consultant?.displayId !== CORPORATE_CONSULTANT_ID
          ? consultant?.displayName || consultant?.url
          : undefined,
      shoppingWithConsultant: consultant?.displayId !== CORPORATE_CONSULTANT_ID || false,
    }),
    [consultant]
  )

  const options: UseFormProps<GuestCheckoutSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      resolver: zodResolver(guestCheckoutSchema),
    }),
    [defaultValues]
  )

  const methods = useForm<GuestCheckoutSchema>(options)
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setFocus,
  } = methods
  // const { createGuestAccount, guestSignIn, validateEmail } = useContext(UserContext)

  const emailRegister = register('email')
  const handleEmailBlur = useCallback<(e: ChangeEvent) => Promise<void>>(
    async event => {
      await emailRegister.onBlur(event)
      setIsValidatingEmail(true)

      try {
        const newEmail = getValues().email
        if (newEmail.length > 0 && !errors.email?.message) {
          validateEmail({
            callback: response => {
              setIsExistingGuest(!!response?.data?.guest)
              setIsExistingCustomer(!!(!response?.data.guest && response?.data.customer))
              setFullName(
                response !== undefined
                  ? response.email_info?.ExistingPersons?.[0]?.PersonFullName || ''
                  : ''
              )
              if (response?.result === 1) {
                if (!response.data.guest && response.data.customer) {
                  setError('email', {
                    message: 'You already have an account.',
                  })
                } else if (response.data.consultant) {
                  setError('email', {
                    message: "You're a consultant.",
                  })
                }
              }
            },
            email: newEmail,
          })
        }
      } finally {
        setIsValidatingEmail(false)
      }
    },
    [emailRegister, errors.email?.message, getValues, setError, validateEmail]
  )

  const onSubmit: SubmitHandler<GuestCheckoutSchema> = async _data => {
    // const { day, email, firstName, lastName, month, receivePromoMessages: _, year } = data
    try {
      setIsLoading(true)
      // const cartId = cartData.id
      // const response = await (isExistingGuest
      //   ? guestSignIn({
      //       cartId,
      //       createAccount: false,
      //       dateOfBirth: { day, month, year },
      //       email,
      //       firstName,
      //       lastName,
      //     })
      //   : createGuestAccount({
      //       cartId,
      //       dateOfBirth: {
      //         day,
      //         month,
      //         year,
      //       },
      //       email,
      //       firstName,
      //       lastName,
      //     }))

      // if (response.Success) {
      //   await navigate(CHECKOUT_URL)
      // } else {
      //   showErrorNotification(
      //     response?.Error?.Message ||
      //       'There was an error proceeding to checkout. Please try again later.'
      //   )
      // }
    } catch (e) {
      // console.error(e)
      // showErrorNotification('There was an error proceeding to checkout. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const dobError = useMemo(
    () => errors.month?.message || errors.day?.message || errors.year?.message,
    [errors]
  )

  const signInHref = useMemo(
    () => ({
      pathname: SIGN_IN_PAGE_PATH,
      query: { email: getValues().email, fullName, redirect: CHECKOUT_PAGE_PATH },
    }),
    [getValues, fullName]
  )

  return (
    <>
      <NextSeo />
      <div className="container mx-auto my-16 flex items-center justify-center">
        <div
          className={`
            max-w-3xl rounded-lg border border-neutral-300 bg-neutral-50 py-10 px-10 md:px-20
          `}
        >
          <h3>Checkout as guest</h3>
          <h6>Before you proceed, we need some information to complete your order.</h6>
          <FormProvider {...methods}>
            <form
              className="flex flex-col md:grid md:auto-rows-auto md:grid-cols-2 md:gap-x-11"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label className="m-0 text-lg" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className={clsx(
                    `
                      focus:outline-brand z-10 h-10 w-full rounded-lg border border-neutral-200
                      bg-neutral px-3 transition-all duration-500 placeholder:text-neutral-300
                      focus:!outline focus:outline-1 focus:outline-offset-0
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
                  <span className=" text-red-700">
                    {errors.firstName?.message ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : undefined}
                  </span>
                  <span className="text-red-700">{errors.firstName?.message}</span>
                </div>
              </div>
              <div>
                <label className="m-0 text-lg" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className={clsx(
                    `
                      focus:outline-brand z-10 h-10 w-full rounded-lg border border-neutral-200
                      bg-neutral px-3 transition-all duration-500 placeholder:text-neutral-300
                      focus:!outline focus:outline-1 focus:outline-offset-0
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
                  <span className=" text-red-700">
                    {errors.lastName?.message ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : undefined}
                  </span>
                  <span className="text-red-700">{errors.lastName?.message}</span>
                </div>
              </div>
              <div>
                <label className="m-0 text-lg" htmlFor="email">
                  Email
                </label>
                <input
                  className={clsx(
                    `
                      focus:outline-brand z-10 h-10 w-full rounded-lg border border-neutral-200
                      bg-neutral px-3 transition-all duration-500
                      placeholder:text-neutral-300 focus:!outline focus:outline-1
                      focus:outline-offset-0
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
                  <span className=" text-red-700">
                    {errors.email?.message ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : undefined}
                  </span>
                  <span className="text-red-700">{errors.email?.message}</span>
                </div>
                {isExistingCustomer && (
                  <Link
                    className={`
                      btn-primary btn mb-4 inline-flex items-center gap-1 no-underline
                      transition-all hover:gap-2 hover:no-underline
                    `}
                    href={signInHref}
                  >
                    Take me to sign in
                    <span className=" md-18">arrow_forward</span>
                  </Link>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="m-0 text-lg" htmlFor="month">
                    Date of Birth
                  </label>
                  <div
                    className="tooltip tooltip-left z-20 !drop-shadow-lg"
                    data-tip={`
                      We need your date of birth to confirm that you are at least 21 years old.
                    `}
                  >
                    <Button className="btn-ghost p-0">
                      <span className="md-18">info</span>
                    </Button>
                  </div>
                </div>
                <div
                  className={clsx(
                    `
                        grid grid-cols-5 items-center justify-between rounded-lg border
                        border-neutral-200 bg-neutral transition-all
                      `,
                    !!dobError && '!border-red-700'
                  )}
                >
                  <Month<GuestCheckoutSchema> control={control} name="month" setFocus={setFocus} />
                  <Day<GuestCheckoutSchema> control={control} name="day" setFocus={setFocus} />
                  <Year<GuestCheckoutSchema> control={control} name="year" setFocus={setFocus} />
                </div>
                <div
                  className={clsx(
                    'flex max-h-0 items-center gap-2 py-2 pb-2 opacity-0 transition-all duration-500',
                    dobError && '!max-h-12 opacity-100'
                  )}
                >
                  <span className=" text-red-700">
                    {dobError ? <ExclamationTriangleIcon className="h-6 w-6" /> : undefined}
                  </span>
                  <span className="text-red-700">{dobError}</span>
                </div>
              </div>
              {!isExistingCustomer && (
                <>
                  <div className="col-span-2 grid">
                    <ConsultantCheckbox disabled={!!defaultValues.shoppingWithConsultant} />
                  </div>
                  <div
                    className={`
                        col-span-2 flex flex-col items-center justify-between gap-4 pt-2 pb-3
                        md:flex-row md:gap-0
                      `}
                  >
                    <button
                      className="btn-primary btn z-10"
                      disabled={isValidatingEmail || isLoading || !!errors.email}
                      type="submit"
                    >
                      Proceed to checkout
                    </button>
                  </div>
                </>
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  )
}
