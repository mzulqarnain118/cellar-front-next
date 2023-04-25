import { ChangeEvent, useCallback, useMemo } from 'react'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Paper, TextInput, Title } from '@mantine/core'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { MAX_DAYS, MONTH_MAP, is21OrOlder, isLeapYear } from '@/features/create-account/dob/util'
import { baseCreateAccountSchema } from '@/features/create-account/form'
import { GuestCheckoutSchema } from '@/features/guest-checkout'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantStore } from '@/lib/stores/consultant'

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

export const Delivery = () => {
  const { consultant } = useConsultantStore()
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()
  const { data: cart } = useCartQuery()

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

  const rightIcon = useMemo(() => <ChevronRightIcon className="h-6 w-6" />, [])

  const handleEmailBlur = useCallback<(e: ChangeEvent) => Promise<void>>(
    async _event => {
      // setIsValidatingEmail(true)

      try {
        const newEmail = getValues().email
        if (newEmail.length > 0 && !errors.email?.message) {
          validateEmail({
            callback: response => {
              // setIsExistingGuest(!!response?.data?.guest)
              // setIsExistingCustomer(!!(!response?.data.guest && response?.data.customer))
              // setFullName(
              //   response !== undefined
              //     ? response.email_info?.ExistingPersons?.[0]?.PersonFullName || ''
              //     : ''
              // )
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
            cartId: cart?.id || '',
            email: newEmail,
            sponsorId: consultant?.displayId || '',
          })
        }
      } finally {
        // setIsValidatingEmail(false)
      }
    },
    [cart?.id, consultant?.displayId, errors.email?.message, getValues, setError, validateEmail]
  )

  const onSubmit: SubmitHandler<GuestCheckoutSchema> = useCallback(async values => {
    console.log('values', values)
  }, [])

  return (
    <Paper mt="lg" p="lg">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* <Title order={3}>Your information</Title>
        <TextInput
          error={errors.firstName?.message}
          label="First Name"
          size="md"
          {...register('firstName')}
        />
        <TextInput
          error={errors.lastName?.message}
          label="Last Name"
          size="md"
          {...register('lastName')}
        />
        <TextInput
          error={errors.email?.message}
          label="Email"
          rightSection={isValidatingEmail ? <Loader size="xs" /> : undefined}
          size="md"
          type="email"
          {...register('email', { onBlur: handleEmailBlur })}
        />
        <Month<GuestCheckoutSchema> control={control} name="month" setFocus={setFocus} />
        <Day<GuestCheckoutSchema> control={control} name="day" setFocus={setFocus} />
        <Year<GuestCheckoutSchema> control={control} name="year" setFocus={setFocus} /> */}

        <Title order={3}>Delivery address</Title>
        <TextInput label="First Name" size="md" />
        <TextInput label="Last Name" size="md" />
        <TextInput label="Address 1" size="md" />
        <TextInput label="Address 2" size="md" />
        <TextInput label="City" size="md" />
        <TextInput label="State" size="md" />
        <TextInput label="Zip Code" size="md" />
        <Button fullWidth color="dark" rightIcon={rightIcon} size="md" type="submit">
          Continue
        </Button>
      </form>
    </Paper>
  )
}
