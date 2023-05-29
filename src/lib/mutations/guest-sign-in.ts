import { useRouter } from 'next/router'

import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

import { api } from '../api'
import { CHECKOUT_PAGE_PATH } from '../paths'
import { useCartQuery } from '../queries/cart'
import { useUserStore } from '../stores/user'
import { Failure } from '../types'
import { toastError } from '../utils/notifications'

interface GuestSignInOptions {
  callback?: () => void
  cartId: string
  createAccount: boolean
  dateOfBirth: { day: string; month: string; year: string }
  email: string
  firstName: string
  lastName: string
  password: string
  redirection?: string
}

interface GuestSuccess {
  Success: true
  Data: { data: { token: string; user: { DisplayID: string } } }
}

export type GuestResponse = GuestSuccess | Failure

export const guestSignIn = async ({ email, firstName }: GuestSignInOptions) =>
  await api('v2/GuestSignIn', {
    json: {
      FirstName: firstName,
      PersonTypeID: 2,
      rememberMe: true,
      username: email,
    },
    method: 'post',
  }).json<GuestResponse>()

export const useGuestSignInMutation = () => {
  const { data: cart } = useCartQuery()
  const router = useRouter()

  return useMutation<GuestResponse | undefined, Error, Omit<GuestSignInOptions, 'cartId'>>({
    mutationFn: options => guestSignIn({ ...options, cartId: cart?.id || '' }),
    mutationKey: ['guest-sign-in'],
    onSuccess: async (
      response,
      {
        callback,
        createAccount,
        dateOfBirth: { day, month, year },
        email,
        firstName,
        lastName,
        password,
        redirection = CHECKOUT_PAGE_PATH,
      }
    ) => {
      if (response?.Success) {
        const token = { Authorization: `Bearer ${response.Data.data.token}` }

        await api('v2/SetOrderOwner', {
          json: { cartId: cart?.id || '' },
          method: 'post',
        })

        const { setUser } = useUserStore.getState()

        setUser(prev => ({
          ...prev,
          dateOfBirth: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
          displayId: response.Data.data.user.DisplayID,
          email,
          isClubMember: false,
          isGuest: !createAccount,
          name: { first: firstName, last: lastName },
          token: response.Data.data.token,
          username: email,
        }))

        // identify(response.Data.data.user.DisplayID, {
        //   displayName: `${firstName} ${lastName}`,
        //   email,
        // })

        if (createAccount) {
          return await api('v2/UpdateGuestAccount', {
            headers: token,
            json: {
              ConvertToCustomer: true,
              DOB: `${year}-${month}-${day}`,
              FirstName: firstName,
              LastName: lastName,
              Password: password,
            },
            method: 'post',
          }).json<GuestResponse>()
        }

        await signIn('sign-in', { callbackUrl: redirection, email, password, redirect: false })

        if (callback) {
          callback()
        }

        router.push(CHECKOUT_PAGE_PATH)
      } else {
        toastError({
          message:
            response?.Error?.Message ||
            'There was an error proceeding to checkout. Please try again later.',
        })
      }
    },
  })
}
