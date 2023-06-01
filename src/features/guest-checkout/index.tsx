import { useCallback, useMemo, useState } from 'react'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingOverlay } from '@mantine/core'
import { NextSeo } from 'next-seo'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { Link } from '@/components/link'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useCreateGuestAccountMutation } from '@/lib/mutations/create-guest-account'
import { useGuestSignInMutation } from '@/lib/mutations/guest-sign-in'
import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ConsultantCheckbox } from '../create-account/consultant/checkbox'
import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from '../create-account/dob/util'
import { baseCreateAccountSchema } from '../create-account/form'

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
  const [isExistingGuest, setIsExistingGuest] = useState(false)
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [fullName, setFullName] = useState('')
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()
  const { mutate: guestSignIn, isLoading: isGuestSigningIn } = useGuestSignInMutation()
  const { mutate: createGuestAccount, isLoading: isGuestCreatingAccount } =
    useCreateGuestAccountMutation()
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
      reValidateMode: 'onChange',
      resolver: zodResolver(guestCheckoutSchema),
    }),
    [defaultValues]
  )

  const methods = useForm<GuestCheckoutSchema>(options)
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
  } = methods

  const onSubmit: SubmitHandler<GuestCheckoutSchema> = useCallback(
    async data => {
      const { day, email, firstName, lastName, month, year } = data

      if (isExistingGuest) {
        guestSignIn({
          createAccount: false,
          dateOfBirth: { day, month, year },
          email,
          firstName,
          lastName,
          password: process.env.GUEST_PASSWORD || '',
        })
      } else {
        createGuestAccount({
          dateOfBirth: {
            day,
            month,
            year,
          },
          email,
          firstName,
          lastName,
        })
      }
    },
    [createGuestAccount, guestSignIn, isExistingGuest]
  )

  const signInHref = useMemo(
    () => ({
      pathname: SIGN_IN_PAGE_PATH,
      query: { email: getValues().email, fullName, redirectTo: CHECKOUT_PAGE_PATH },
    }),
    [getValues, fullName]
  )

  return (
    <>
      <NextSeo />
      <div className="container mx-auto my-16 flex items-center justify-center">
        <div
          className={`
            relative max-w-3xl rounded border border-neutral-300 bg-neutral-50 px-10 py-10 md:px-20
          `}
        >
          <LoadingOverlay
            className="rounded"
            visible={isGuestCreatingAccount || isGuestSigningIn}
          />
          <Typography as="h3">Checkout as guest</Typography>
          <Typography as="h6">
            Before you proceed, we need some information to complete your order.
          </Typography>
          <FormProvider {...methods}>
            <form
              className={`
                flex flex-col md:grid md:auto-rows-auto md:grid-cols-2 md:gap-x-11 md:items-start
              `}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                error={errors?.firstName?.message}
                label="First name"
                {...register('firstName')}
              />
              <Input
                error={errors?.lastName?.message}
                label="Last name"
                {...register('lastName')}
              />
              <Input
                error={errors?.email?.message}
                label="Email"
                loading={isValidatingEmail}
                type="email"
                {...register('email', {
                  onBlur: event => {
                    const newEmail = event.target.value.trim()

                    if (newEmail.length > 0 && !errors.email?.message) {
                      validateEmail({
                        callback: response => {
                          setIsExistingGuest(!!response?.data?.guest)
                          setIsExistingCustomer(
                            !!(!response?.data.guest && response?.data.customer)
                          )
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
                  },
                })}
              />
              <DateOfBirthPicker />
              {isExistingCustomer ? (
                <Link button as={SIGN_IN_PAGE_PATH} href={signInHref}>
                  Take me to sign in
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <div className="col-span-2 grid">
                    <ConsultantCheckbox disabled={!!defaultValues.shoppingWithConsultant} />
                  </div>
                  <div
                    className={`
                      col-span-2 flex flex-col items-center justify-between gap-4 pb-3 pt-2
                      md:flex-row md:gap-0
                    `}
                  >
                    <Button
                      disabled={
                        isValidatingEmail ||
                        isGuestSigningIn ||
                        isGuestCreatingAccount ||
                        !!errors.email
                      }
                      type="submit"
                    >
                      Proceed to checkout
                    </Button>
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
