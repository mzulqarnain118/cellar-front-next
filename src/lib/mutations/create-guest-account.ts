import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

import { api } from '../api'
import { CORPORATE_CONSULTANT_ID } from '../constants'
import { useCartQuery } from '../queries/cart'
import { useConsultantStore } from '../stores/consultant'
import { useUserStore } from '../stores/user'

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

interface CreateGuestAccountResponse {
  result: boolean
  error?: string
  data: {
    token: string
    user: {
      FirstName: string
      LastName: string
      DisplayID: string
    }
    sponsor: {
      DisplayID: string
      DisplayName: string
      Url: string
    }
    ExceptionMessage?: string
  }
}

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
  const { setUser } = useUserStore()

  return useMutation<CreateGuestAccountResponse, Error, CreateGuestAccountOptions>(
    ['create-guest-account'],
    options =>
      createGuestAccount({
        ...options,
        cartId: options.cartId || cart?.id,
        consultantDisplayId: options.consultantDisplayId || consultant.displayId,
      }),
    {
      onSuccess: async (
        createGuestAccountData,
        { callback, dateOfBirth: { day, month, year }, email, firstName, lastName, redirection }
      ) => {
        if (!createGuestAccountData?.data) {
          // showErrorNotification('There was an error creating your account.')
          return
        }
        const token = { Authorization: `bearer ${createGuestAccountData.data.token}` }

        if (!createGuestAccountData.result || createGuestAccountData.data.ExceptionMessage) {
          // showErrorNotification(signUpData.error || 'There was an error creating your account.')
          return
        } else {
          await api(SET_ORDER_PERSON_URL, {
            headers: token,
            json: { cartId: cart?.id || '' },
            method: 'post',
          }).json()
          const userStateData = {
            dateOfBirth: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
            displayId: createGuestAccountData.data.user.DisplayID,
            email,
            isClubMember: false,
            isGuest: true,
            name: { first: firstName, last: lastName },
            token: createGuestAccountData.data.token,
            username: email,
          }

          setUser(prev => ({ ...prev, ...userStateData, shippingState: prev.shippingState }))

          await signIn('sign-in', {
            callbackUrl: redirection,
            email,
            // ! TODO: Password?
            password: '',
            redirect: false,
          })

          if (callback !== undefined) {
            callback()
          }
        }
      },
    }
  )
}
