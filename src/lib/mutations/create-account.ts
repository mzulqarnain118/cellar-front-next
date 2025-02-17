import { identify } from '@fullstory/browser'
import { useMutation } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'

import { api, noHooksApi } from '../api'
import { CORPORATE_CONSULTANT_ID } from '../constants'
import { useCartQuery } from '../queries/cart'
import { useConsultantStore } from '../stores/consultant'
import { Consultant } from '../types'

export interface CreateAccountOptions {
  callback?: () => void
  cartId?: string
  consultantDisplayId?: string
  dateOfBirth: string
  email: string
  firstName: string
  lastName: string
  password: string
  redirection?: string
}

interface SignUpResponse {
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

interface GetPersonPortalInfoResponse {
  DisplayID: string
  FirstName: string
  LastName: string
  Username: string
}

interface GetClubInfoResponse {
  clubs_count: number
  clubs: string[]
  is_club_member: boolean
}

const SET_ORDER_PERSON_URL = 'v2/SetOrderOwner'

const createAccount = async (data: CreateAccountOptions) =>
  await api('shop/cartSignup', {
    json: {
      DateOfBirth: data.dateOfBirth,
      cartId: data.cartId || '',
      email: data.email,
      firstname: data.firstName,
      lastname: data.lastName,
      password: data.password,
      sponsorId: data.consultantDisplayId || CORPORATE_CONSULTANT_ID,
    },
    method: 'POST',
    searchParams: { newUserAddress: 1 },
  }).json<SignUpResponse>()

export const useCreateAccountMutation = () => {
  const { data: cart } = useCartQuery()
  const { consultant, setConsultant } = useConsultantStore()

  return useMutation<SignUpResponse, Error, CreateAccountOptions>({
    mutationFn: options =>
      createAccount({ ...options, cartId: cart?.id, consultantDisplayId: consultant.displayId }),
    mutationKey: ['create-account'],
    onSuccess: async (signUpData, { callback, email, password, redirection }) => {
      if (!signUpData?.data) {
        // showErrorNotification('There was an error creating your account.')
        return
      }
      const token = { Authorization: `bearer ${signUpData.data.token}` }

      if (!signUpData.result || signUpData.data.ExceptionMessage) {
        // showErrorNotification(signUpData.error || 'There was an error creating your account.')
      } else {
        await api(SET_ORDER_PERSON_URL, {
          headers: token,
          json: { cartId: cart?.id || '' },
          method: 'post',
        }).json()
        const personPortalInfo = await noHooksApi('Person/GetPersonPortalInfo', {
          headers: token,
          method: 'get',
        }).json<GetPersonPortalInfoResponse>()
        const consultantDisplayId = signUpData.data.sponsor?.DisplayID || consultant.displayId
        const clubInfo = await api(`clubs/${personPortalInfo.DisplayID}`, {
          headers: token,
          method: 'get',
        }).json<GetClubInfoResponse>()

        const userStateData = {
          displayId: personPortalInfo.DisplayID,
          email: personPortalInfo.Username,
          isClubMember: clubInfo.is_club_member,
          name: {
            first: personPortalInfo.FirstName,
            last: personPortalInfo.LastName,
          },
          token: signUpData.data.token,
        }

        let consultantStateData: Consultant = {
          displayId: signUpData.data.sponsor?.DisplayID || consultant.displayId,
          displayName: signUpData.data.sponsor?.DisplayName || consultant.displayName,
          url: signUpData.data.sponsor?.Url || consultant.url,
        }

        // Set user consultant if their sponsor is the corporate sponsor.
        if (
          signUpData.data.sponsor?.DisplayID === CORPORATE_CONSULTANT_ID &&
          consultantDisplayId !== CORPORATE_CONSULTANT_ID
        ) {
          consultantStateData = consultant
        }

        setConsultant(consultantStateData)

        // Tell FullStory who you are.
        identify(userStateData.displayId, {
          displayName: `${userStateData.name.first} ${userStateData.name.last}`,
          email: userStateData.email,
        })

        await signIn('sign-in', { callbackUrl: redirection, email, password, redirect: false })

        localStorage.setItem('createAccountConsultant', 'false')

        if (callback !== undefined) {
          callback()
        }
      }
    },
  })
}
