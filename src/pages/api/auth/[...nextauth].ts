import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { noHooksApi } from '@/lib/api'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCheckoutStore } from '@/lib/stores/checkout'
import { useConsultantStore } from '@/lib/stores/consultant'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Consultant, User } from '@/lib/types'

interface LoginResponse {
  result: boolean
  type: string
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
      Email: string
      DateCreated: string
      PersonTypeID: number
      CountryCode: string
    }
    sponsor: {
      Address: {
        City: string | null
        CountryName: string | null
        PostalCode: string | null
        ProvinceAbbreviation: string | null
      } | null
      EmailAddress: string | null
      DisplayID: string
      DisplayName: string
      ImageURL: string | null
      PersonID: number
      PhoneNumber: string | null
      ProfileMessage: string | null
      ProfileWebsite: string | null
      SocialLinks:
        | {
            LinkBaseURL: string
            LinkName: string
            URL: string
          }[]
        | null
      Url: string
    }
    token_details: {
      access_token: string
      '.issued': string
      '.expires': string
      expires_in: number
      refresh_token: string
      '.refresh_token_expires': string
    }
  }
  error?: string
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

// interface GetCuratedCartResponse {
//   result: boolean
//   data?: {
//     OrderID: number
//     OrderStatusID: number
//     ShoppingCartID: number
//     RecommendedByPersonID: number
//     RecommendedByPersonDisplayID: string
//     RecommendationNote: string
//     RecommendationNotePartyDisplayID: string | null
//     OrderDisplayID: string
//     OrderDate: string
//     CartID: string
//     OrderOwnerDisplayID: string
//     OrderOwnerUsername: string
//     PartyDisplayID: string | null
//   }
// }

const isUser = (
  value: unknown
): value is User & {
  name?: string | null | undefined
  email?: string | null | undefined
  image?: string | null | undefined
} => value instanceof Object && 'token' in value

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user
      }
      return token
    },
    session: async ({
      session,
      token: {
        // @ts-ignore
        user: { user },
      },
    }) => {
      if (isUser(user)) {
        session.user = user
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    signOut: async () => {
      useCheckoutStore.getState().actions.reset()
    },
  },
  pages: {
    signIn: SIGN_IN_PAGE_PATH,
  },
  providers: [
    CredentialsProvider({
      authorize: async credentials => {
        const payload = {
          PersonTypeID: 2,
          password:
            !!credentials?.password && credentials?.password.length > 0
              ? credentials.password
              : process.env.GUEST_PASSWORD,
          rememberMe: false,
          username: credentials?.email,
        }

        let user: User | null = null
        try {
          const response = await noHooksApi('CustomLogin', {
            json: payload,
            method: 'post',
          })

          if (response.ok) {
            const loginData = await response.json<LoginResponse>()

            if (loginData.result) {
              const headers = {
                Authorization: `Bearer ${loginData.data.token}`,
                SCAuth: process.env.NEXT_PUBLIC_TOWER_API_KEY,
              }
              const personPortalInfo = await noHooksApi('Person/GetPersonPortalInfo', {
                headers,
              }).json<GetPersonPortalInfoResponse>()

              await noHooksApi('v2/SetOrderOwner', {
                headers,
                json: { cartId: '' },
                method: 'post',
              }).json()
              const clubInfo = await noHooksApi(`clubs/${personPortalInfo.DisplayID}`, {
                headers,
              }).json<GetClubInfoResponse>()

              const { shippingState } = useShippingStateStore.getState()
              const userStateData: User = {
                displayId: personPortalInfo.DisplayID,
                email: loginData.data.user.Email,
                fullName: `${personPortalInfo.FirstName} ${personPortalInfo.LastName}`,
                isClubMember: clubInfo.is_club_member,
                isGuest: !credentials?.password || credentials?.password.length === 0,
                name: {
                  first: personPortalInfo.FirstName,
                  last: personPortalInfo.LastName,
                },
                personId: loginData.data.user.UserID,
                shippingState,
                token: loginData.data.token,
                username: loginData.data.user.Username,
              }

              let consultantStateData: Consultant = {
                address: loginData.data.sponsor.Address
                  ? {
                      city: loginData.data.sponsor.Address.City || undefined,
                      country: loginData.data.sponsor.Address.CountryName || undefined,
                      stateAbbreviation:
                        loginData.data.sponsor.Address.ProvinceAbbreviation || undefined,
                      zipCode: loginData.data.sponsor.Address.PostalCode || undefined,
                    }
                  : undefined,
                displayId: loginData.data.sponsor.DisplayID,
                displayName: loginData.data.sponsor.DisplayName,
                emailAddress: loginData.data.sponsor.EmailAddress || undefined,
                imageUrl: loginData.data.sponsor.ImageURL || undefined,
                phoneNumber: loginData.data.sponsor.PhoneNumber || undefined,
                profileMessage: loginData.data.sponsor.ProfileMessage || undefined,
                profileWebsite: loginData.data.sponsor.ProfileWebsite || undefined,
                socialLinks:
                  !!loginData.data.sponsor.SocialLinks &&
                  loginData.data.sponsor.SocialLinks.length > 0
                    ? loginData.data.sponsor.SocialLinks.map(link => ({
                        baseUrl: link.LinkBaseURL,
                        name: link.LinkName,
                        url: link.URL,
                      }))
                    : undefined,
                url: loginData.data.sponsor.Url,
              }

              // Set user consultant if their sponsor is the corporate sponsor.
              const { consultant, setConsultant } = useConsultantStore.getState()
              if (
                loginData.data.sponsor.DisplayID === CORPORATE_CONSULTANT_ID &&
                consultant.displayId !== CORPORATE_CONSULTANT_ID
              ) {
                consultantStateData = consultant
              }

              const tokenDetails = loginData.data.token_details
              user = {
                ...userStateData,
                tokenDetails: {
                  accessToken: tokenDetails.access_token,
                  expires: new Date(tokenDetails['.expires']).toDateString(),
                  expiresIn: tokenDetails.expires_in,
                  issued: new Date(tokenDetails['.issued']).toDateString(),
                  refreshToken: tokenDetails.refresh_token,
                  refreshTokenExpires: new Date(
                    tokenDetails['.refresh_token_expires']
                  ).toDateString(),
                },
              }

              // if (consultant.displayId === CORPORATE_CONSULTANT_ID) {
              setConsultant(consultantStateData)
              // }

              // const curatedCartInfo = await noHooksApi('orders/getcustomerordersforwebsite', {
              //   json: {
              //     ConsultantDisplayID:
              //       consultant.displayId !== CORPORATE_CONSULTANT_ID
              //         ? consultant.displayId
              //         : loginData.data.sponsor.DisplayID,
              //     CustomerDisplayID: userStateData.displayId,
              //   },
              //   method: 'post',
              // }).json<GetCuratedCartResponse>()

              // const { setCuratedCart } = useCuratedCartStore.getState()
              // if (curatedCartInfo.result && curatedCartInfo.data?.CartID) {
              //   setCuratedCart({
              //     cartAccepted: false,
              //     cartId: curatedCartInfo.data.CartID,
              //     messageDismissed: false,
              //     partyDisplayId: curatedCartInfo.data.PartyDisplayID || undefined,
              //     recommendedByPersonDisplayId:
              //       curatedCartInfo.data.RecommendedByPersonDisplayID || '',
              //   })
              // }

              // if (
              //   data.redirection &&
              //   data.redirection !== '/login' &&
              //   data.redirection !== '/signup' &&
              //   data.redirection !== '/forgot-password'
              // ) {
              //   if (data.redirection.includes('checkout') && items.length === 0) {
              //     await navigate('/')
              //   } else {
              //     await navigate(data.redirection)
              //   }
              // } else {
              //   await navigate('/')
              // }
              // }
            } else {
              return null
            }
          } else {
            return null
          }
          return { id: user?.displayId || '', user }
        } catch (error) {
          // ! TODO: Handle error.
          return null
        }
      },
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      id: 'sign-in',
      name: 'User Account',
    }),
  ],
}

export default NextAuth(authOptions)
