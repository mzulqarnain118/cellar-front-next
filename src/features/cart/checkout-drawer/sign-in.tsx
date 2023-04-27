import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Button, Loader, PasswordInput, Text, TextInput, Title } from '@mantine/core'
import { signIn } from 'next-auth/react'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useValidateEmailMutation } from '@/lib/mutations/validate-email'
import { CHECKOUT_PAGE_PATH } from '@/lib/paths'

const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  password: z.string().min(1, { message: 'Please enter your password.' }).trim(),
})

type SignInSchema = z.infer<typeof signInSchema>

const rightIcon = <ChevronRightIcon className="h-4 w-4" />

interface SignInProps {
  handleBack: () => void
  hideOverlay: () => void
  showOverlay: () => void
}

export const SignIn = ({ handleBack, hideOverlay, showOverlay }: SignInProps) => {
  const router = useRouter()
  const options: UseFormProps<SignInSchema> = useMemo(
    () => ({
      defaultValues: {
        email: '',
        password: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(signInSchema),
    }),
    []
  )
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm<SignInSchema>(options)
  const { mutate: validateEmail, isLoading: isValidatingEmail } = useValidateEmailMutation()
  const onSubmit: SubmitHandler<SignInSchema> = useCallback(
    async ({ email, password }) => {
      showOverlay()
      const response = await signIn('sign-in', { email, password, redirect: false })
      hideOverlay()

      if (!response?.ok) {
        // notifications.show({ message: 'Incorrect email or password.' })
      } else {
        router.push(CHECKOUT_PAGE_PATH)
      }
    },
    [hideOverlay, router, showOverlay]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ActionIcon aria-label="Go back" color="dark" variant="subtle" onClick={handleBack}>
        <ArrowLeftIcon className="h-5 w-5" />
      </ActionIcon>
      <Title className="mt-4" order={6}>
        We missed you!
      </Title>
      <Text className="mb-4" color="neutral" size="md">
        Sign in to continue your order
      </Text>
      <div className="space-y-2">
        <TextInput
          error={errors.email?.message}
          label="Email"
          rightSection={isValidatingEmail ? <Loader size="xs" variant="oval" /> : undefined}
          {...register('email', {
            disabled: isValidatingEmail,
            onBlur: event => {
              if (event.target.value.length > 0) {
                validateEmail({
                  callback: response => {
                    if (response?.result === 1 && response?.data.consultant) {
                      setError('email', {
                        message: "You're a consultant.",
                      })
                    }
                  },
                  email: event.target.value,
                })
              }
            },
          })}
        />
        <PasswordInput
          error={errors.password?.message}
          label="Password"
          {...register('password')}
        />
      </div>
      <Button
        fullWidth
        className="mt-4"
        color="brand"
        disabled={!isValid}
        rightIcon={rightIcon}
        size="md"
        type="submit"
        variant="filled"
      >
        Sign in and continue
      </Button>
    </form>
  )
}
