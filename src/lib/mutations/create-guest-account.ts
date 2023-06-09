import { useRouter } from 'next/router'

import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

import { api } from '../api'
import { CORPORATE_CONSULTANT_ID } from '../constants'
import { CHECKOUT_PAGE_PATH } from '../paths'
import { useCartQuery } from '../queries/cart'
import { useConsultantStore } from '../stores/consultant'
import { Failure } from '../types'
import { toastError } from '../utils/notifications'

export interface CreateGuestAccountOptions {
  callback?: () => void
  cartId?: string
  consultantDisplayId?: string
  dateOfBirth: {
    day: string
    month: string
    year: string
  }
  email: string
  firstName: string
  lastName: string
  redirection?: string
}

interface CreateGuestAccountSuccess {
  Success: true
  Data: {
    data: {
      token: string
      user: {
        Status: string
        Type: string
        SponsorName: string
        SponsorDisplayID: string
        DisplayID: string
        UserID: number
        Username: string
        LoginGuid: string | null
        DateCreated: string
        PersonTypeID: number
        LanguageCode: string
        CountryCode: string | null
        Email: string
      }
    }
  }
}

type CreateGuestAccountResponse = CreateGuestAccountSuccess | Failure

const SET_ORDER_PERSON_URL = 'v2/SetOrderOwner'

const createGuestAccount = async (data: CreateGuestAccountOptions) =>
  await api('v2/GuestSignUp', {
    json: {
      DateOfBirth: `${data.dateOfBirth.month}/${data.dateOfBirth.day}/${data.dateOfBirth.year}`,
      cartId: data.cartId || '',
      email: data.email,
      firstname: data.firstName,
      lastname: data.lastName,
      sponsorId: data.consultantDisplayId || CORPORATE_CONSULTANT_ID,
    },
    method: 'post',
    searchParams: { newUserAddress: 1 },
  }).json<CreateGuestAccountResponse>()

export const useCreateGuestAccountMutation = () => {
  const { data: cart } = useCartQuery()
  const { consultant } = useConsultantStore()
  const router = useRouter()

  return useMutation<CreateGuestAccountResponse, Error, CreateGuestAccountOptions>({
    mutationFn: options =>
      createGuestAccount({
        ...options,
        cartId: options.cartId || cart?.id,
        consultantDisplayId: options.consultantDisplayId || consultant.displayId,
      }),
    mutationKey: ['create-guest-account'],
    onSuccess: async (createGuestAccountData, { callback, email, redirection }) => {
      if (!createGuestAccountData?.Success) {
        toastError({
          message:
            createGuestAccountData.Error.Message ||
            'There was an error proceeding to checkout. Please try again later.',
        })
        return
      }
      const token = { Authorization: `bearer ${createGuestAccountData.Data.data.token}` }

      await api(SET_ORDER_PERSON_URL, {
        headers: token,
        json: { cartId: cart?.id || '' },
        method: 'post',
      }).json()

      await signIn('sign-in', {
        callbackUrl: redirection,
        email,
        password: process.env.GUEST_PASSWORD || '',
        redirect: false,
      })

      if (callback !== undefined) {
        callback()
      }

      router.push(CHECKOUT_PAGE_PATH)
    },
  })
}
