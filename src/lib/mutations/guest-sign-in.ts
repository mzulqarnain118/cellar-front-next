import { QueryClient, useMutation } from '@tanstack/react-query'

import { api } from '../api'
import { CART_QUERY_KEY } from '../queries/cart'
import { useUserStore } from '../stores/user'
import { Cart, Failure } from '../types'

interface GuestSignInOptions {
  cartId: string
  createAccount: boolean
  dateOfBirth: { day: string; month: string; year: string }
  email: string
  firstName: string
  lastName: string
  password: string
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

export const useGuestSignInMutation = () =>
  useMutation<GuestResponse | undefined, Error, GuestSignInOptions>(
    ['guest-sign-in'],
    options => guestSignIn(options),
    {
      onSuccess: async (
        response,
        { createAccount, dateOfBirth: { day, month, year }, email, firstName, lastName, password }
      ) => {
        if (response?.Success) {
          const token = { Authorization: `Bearer ${response.Data.data.token}` }

          const queryClient = new QueryClient()
          const cart = queryClient.getQueryData<Cart>(CART_QUERY_KEY)

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
        }
      },
    }
  )
