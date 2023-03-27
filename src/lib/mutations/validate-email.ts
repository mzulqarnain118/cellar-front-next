import { useMutation } from '@tanstack/react-query'

import { api } from '../api'

export const VALIDATE_EMAIL_QUERY_KEY = ['validate-email']
export interface ValidateEmailOptions {
  email: string
  callback: (response: ValidateEmail) => void
  cartId: string
  sponsorId: string
  source?: string
}

export interface ValidateEmail {
  data: {
    consultant: boolean
    customer: boolean
    guest: boolean
  }
  email_info?: { ExistingPersons?: { PersonFullName?: string }[] }
  message: string
  result: number
}

const validateEmail = async (data: ValidateEmailOptions) => {
  try {
    const response = await api('shop/catchEmail', {
      json: data,
      method: 'post',
    }).json<ValidateEmail>()
    data.callback(response)
    return response
  } catch {
    // ! TODO: handle error.
    throw new Error('Something went wrong.')
  }
}

export const useValidateEmailMutation = () =>
  useMutation<
    {
      data: { consultant: boolean; customer: boolean; guest: boolean }
      message: string
      result: number
    },
    Error,
    ValidateEmailOptions
  >(VALIDATE_EMAIL_QUERY_KEY, data => validateEmail(data))
