import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { toastSuccess } from '@/lib/utils/notifications'

interface Response {
  result: boolean
}

interface ForgotPasswordOptions {
  email: string
  recaptcha: string
}

export const forgotPassword = async ({ email, recaptcha }: ForgotPasswordOptions) => {
  try {
    const response = await api('ResetPassword', {
      json: {
        Email: email,
        RecaptchaPublicKey: '',
        RecaptchaResponse: recaptcha,
      },
      method: 'post',
    }).json<Response>()

    return response
  } catch {
    throw new Error('There was an error resetting the password.')
  }
}

export const useForgotPasswordMutation = () =>
  useMutation<Response | undefined, Error, ForgotPasswordOptions>({
    mutationFn: data => forgotPassword(data),
    mutationKey: ['forgot-password'],
    onSuccess: response => {
      if (response?.result) {
        toastSuccess({
          message:
            'If an account exists with that email, password reset instructions were sent to that email.',
        })
      }
    },
  })
