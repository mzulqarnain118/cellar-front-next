import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Collapse, PasswordInput, Switch, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { ConsultantCheckbox } from '@/components/consultant-checkbox'
import { DateOfBirthPicker } from '@/components/date-of-birth-picker'
import { Link } from '@/components/link'
import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from '@/features/create-account/dob/util'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CreateAccountOptions, useCreateAccountMutation } from '@/lib/mutations/create-account'
import { useCreateGuestAccountMutation } from '@/lib/mutations/create-guest-account'
import { useGuestSignInMutation } from '@/lib/mutations/guest-sign-in'
import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'

const passwordSchema = z
  .object({
    confirmPassword: z.string().trim().min(7, { message: 'Please confirm your password.' }),
    password: z
      .string()
      .trim()
      .min(7, { message: 'Your password must be at least 7 characters.' })
      .regex(/.*[A-Z].*/g, 'Your password must contain at least 1 uppercase letter.')
      .regex(/.*[a-z].*/g, 'Your password must contain at least 1 lowercase letter.')
      .regex(/.*\d.*/g, 'Your password must contain at least 1 number.'),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Your passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

const consultantSchema = z
  .object({
    consultant: z.string().min(1, { message: 'Please select a consultant.' }),
    shoppingWithConsultant: z.boolean(),
  })
  .superRefine((data, context) => {
    if (data.shoppingWithConsultant && !data.consultant) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a consultant.',
        path: ['consultant'],
      })
    }
  })

const preCheckoutSchemaBase = z
  .object({
    createAccount: z.boolean(),
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

export type PreCheckoutSchema = z.infer<typeof preCheckoutSchemaBase>
export type PasswordSchema = z.infer<typeof passwordSchema>
export type ConsultantSchema = z.infer<typeof consultantSchema>

const rightIcon = <ChevronRightIcon className="h-4 w-4" />

export const CheckoutDrawer = () => {
  const { data: session } = useSession()
  const { data: consultant } = useConsultantQuery()
  const [createAccountOpened, { toggle: toggleCreateAccount }] = useDisclosure(false)
  const [passwordVisible, { toggle: togglePasswordVisible }] = useDisclosure(false)

  const { day, month, year } = useMemo(() => {
    const dateOfBirth = session?.user.dateOfBirth

    return {
      day: dateOfBirth?.getDate().toString() || '',
      month: dateOfBirth?.getMonth().toString() || '',
      year: dateOfBirth?.getFullYear().toString() || '',
    }
  }, [session?.user.dateOfBirth])

  const defaultValues: PreCheckoutSchema = useMemo(
    () => ({
      createAccount: false,
      day,
      email: '',
      firstName: '',
      lastName: '',
      month,
      year,
    }),
    [day, month, year]
  )

  const useFormProps: UseFormProps<PreCheckoutSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(preCheckoutSchemaBase),
    }),
    [defaultValues]
  )

  const methods = useForm<PreCheckoutSchema>(useFormProps)
  const {
    formState: { dirtyFields, errors, isValid },
    getValues,
    handleSubmit,
    register,
    setError,
  } = methods

  const consultantOptions: UseFormProps<ConsultantSchema> = useMemo(
    () => ({
      defaultValues: {
        consultant: consultant?.displayId === CORPORATE_CONSULTANT_ID ? '' : consultant.displayId,
        shoppingWithConsultant: consultant?.displayId !== CORPORATE_CONSULTANT_ID,
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(consultantSchema),
    }),
    [consultant?.displayId]
  )
  const consultantMethods = useForm<ConsultantSchema>(consultantOptions)
  const {
    formState: { isDirty: consultantDirty, isValid: consultantValid },
    getValues: getConsultantValues,
  } = consultantMethods

  const passwordOptions: UseFormProps<PasswordSchema> = useMemo(
    () => ({
      defaultValues: { confirmPassword: '', password: '' },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(passwordSchema),
    }),
    []
  )
  const {
    formState: { errors: passwordErrors, isDirty: passwordDirty, isValid: passwordValid },
    getValues: getPasswordValues,
    register: passwordRegister,
    reset: resetPasswordForm,
  } = useForm<PasswordSchema>(passwordOptions)

  const { createAccount } = getValues()
  const { shoppingWithConsultant } = getConsultantValues()
  const valid =
    isValid &&
    (createAccount ? passwordDirty && passwordValid : true) &&
    (shoppingWithConsultant ? consultantDirty && consultantValid : true)
  const { data: cartData } = useCartQuery()
  const [isGuest, setIsGuest] = useState(false)
  // ! TODO: Handle existing customers and consultants.
  const [_isExistingCustomer, setIsExistingCustomer] = useState(false)
  const { mutate: createAccountApi } = useCreateAccountMutation()
  const { mutate: createGuestAccount } = useCreateGuestAccountMutation()
  const { mutate: guestSignIn } = useGuestSignInMutation()
  const { mutate: validateEmail } = useValidateEmailMutation()
  const router = useRouter()

  const onSubmit: SubmitHandler<PreCheckoutSchema> = useCallback(
    async values => {
      const { createAccount, day, email, firstName, lastName, month, password, year } = {
        ...values,
        ...getConsultantValues(),
        ...getPasswordValues(),
      }

      const dateOfBirth = `${month}/${day}/${year}`
      const payload: CreateAccountOptions = {
        callback: () => {
          router.push(CHECKOUT_PAGE_PATH)
        },
        dateOfBirth,
        email,
        firstName,
        lastName,
        password,
      }

      if (isGuest) {
        const cartId = cartData?.id || ''
        guestSignIn({
          callback: () => {
            router.push(CHECKOUT_PAGE_PATH)
          },
          cartId,
          createAccount,
          dateOfBirth: { day, month, year },
          email,
          firstName,
          lastName,
          password,
        })
      } else if (createAccount) {
        createAccountApi(payload)
      } else {
        createGuestAccount({
          callback: () => {
            router.push(CHECKOUT_PAGE_PATH)
          },
          dateOfBirth: { day, month, year },
          email,
          firstName,
          lastName,
        })
      }
    },
    [
      cartData?.id,
      createAccountApi,
      createGuestAccount,
      getConsultantValues,
      getPasswordValues,
      guestSignIn,
      isGuest,
      router,
    ]
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Button
          className="p-0 underline"
          color="brand"
          component={Link}
          href={SIGN_IN_PAGE_PATH}
          rightIcon={rightIcon}
          variant="subtle"
        >
          Sign in for a faster checkout experience
        </Button>
        <Title order={6}>Your information</Title>
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              error={errors.firstName?.message}
              label="First name"
              rightSection={
                errors.firstName?.message === undefined && dirtyFields.firstName ? (
                  <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
                ) : undefined
              }
              {...register('firstName')}
            />
            <TextInput
              error={errors.lastName?.message}
              label="Last name"
              rightSection={
                errors.lastName?.message === undefined && dirtyFields.lastName ? (
                  <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
                ) : undefined
              }
              {...register('lastName')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              error={errors.email?.message}
              label="Email"
              rightSection={
                errors.email?.message === undefined && dirtyFields.email ? (
                  <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
                ) : undefined
              }
              type="email"
              {...register('email', {
                onBlur: event => {
                  validateEmail({
                    callback: response => {
                      const isExisting =
                        response?.result === 1 && response?.data.customer && !response.data.guest
                      setIsExistingCustomer(isExisting)

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
                    cartId: cartData?.id || '',
                    email: event.target.value.trim(),
                    sponsorId: consultant?.displayId || '',
                  })
                },
              })}
            />
            <DateOfBirthPicker />
          </div>
          <FormProvider {...consultantMethods}>
            <ConsultantCheckbox />
          </FormProvider>
          <Switch
            color="dark"
            label="Create an account to save time during my next order."
            {...register('createAccount', {
              onChange: () => {
                toggleCreateAccount()
                resetPasswordForm()
              },
            })}
          />
          <Collapse in={createAccountOpened}>
            <PasswordInput
              error={passwordErrors.password?.message}
              label="Password"
              visible={passwordVisible}
              onVisibilityChange={togglePasswordVisible}
              {...passwordRegister('password')}
            />
            <PasswordInput
              error={passwordErrors.confirmPassword?.message}
              label="Confirm password"
              visible={passwordVisible}
              onVisibilityChange={togglePasswordVisible}
              {...passwordRegister('confirmPassword')}
            />
          </Collapse>
          <Button
            fullWidth
            className="col-span-2"
            color="brand"
            disabled={!valid}
            rightIcon={rightIcon}
            size="md"
            type="submit"
          >
            Continue to checkout
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
