import { useMutation } from '@tanstack/react-query'

import { api } from '../api'
import { useCartQuery } from '../queries/cart'
import { useConsultantQuery } from '../queries/consultant'

export const VALIDATE_EMAIL_QUERY_KEY = ['validate-email']
export interface ValidateEmailOptions {
  email: string
  callback?: (response: ValidateEmail) => void
  cartId?: string
  sponsorId?: string
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
    return response
  } catch {
    throw new Error('Something went wrong.')
  }
}

export const useValidateEmailMutation = () => {
  const { data: cart } = useCartQuery()
  const { data: consultant } = useConsultantQuery()

  return useMutation<ValidateEmail, Error, ValidateEmailOptions>({
    mutationFn: data =>
      validateEmail({ ...data, cartId: cart?.id || '', sponsorId: consultant.displayId }),
    mutationKey: VALIDATE_EMAIL_QUERY_KEY,
    onSuccess: (response, data) => {
      if (data.callback) {
        data.callback(response)
      }
    },
  })
}
