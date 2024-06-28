import ky, { BeforeRequestHook } from 'ky'
import { getCsrfToken, getSession, signOut } from 'next-auth/react'

import { useCheckoutStore } from './stores/checkout'
import { useGuestStore } from './stores/guest'

const baseApiUrl = process.env.NEXT_PUBLIC_TOWER_API_URL
const towerApiKey = process.env.NEXT_PUBLIC_TOWER_API_KEY

const addTowerKeyAndAuthHeaders: BeforeRequestHook = async (request, _options) => {
  const session = await getSession()
  const { token: guestToken, setToken: setGuestToken } = useGuestStore.getState()
  const accessToken = session?.user.tokenDetails?.accessToken || guestToken

  if (towerApiKey !== undefined) {
    request.headers.set('SCAuth', towerApiKey)
  }

  if (accessToken !== undefined) {
    request.headers.set('Authorization', `Bearer ${accessToken}`)
  } else {
    const guestToken = await ky(`${baseApiUrl}/api/GetGuestToken`, {
      searchParams: { languageCode: 'en' },
    }).json<{
      data: { generic_token: { APIToken: { access_token: string } } }
    }>()
    const newGuestToken = guestToken.data.generic_token.APIToken.access_token
    setGuestToken(newGuestToken)
    request.headers.set('Authorization', `Bearer ${newGuestToken}`)
  }

  // if (
  //   request.method === 'POST' &&
  //   (request.body instanceof Object || Array.isArray(request.body))
  // ) {
  //   request.headers.set('Content-Type', 'application/json')
  // }
  // // Add X-Frame-Options header to prevent clickjacking
  // request.headers.set('X-Frame-Options', 'SAMEORIGIN')
}

interface RefreshTokenResponse {
  access_token: string
  '.expires': string
  expires_in: number
  '.issued': string
  refresh_token: string
  '.refresh_token_expires': string
  token_type: string
  userName: string
}

const updateTokenIfNecessary: BeforeRequestHook = async (request, _options) => {
  const session = await getSession()
  const tokenExpiration = session?.user.tokenDetails?.expires
  const {
    actions: { reset },
  } = useCheckoutStore.getState()

  if (tokenExpiration !== undefined) {
    const tokenExpirationDate = new Date(tokenExpiration)
    const now = new Date()
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    )

    if (nowUTC > tokenExpirationDate.getTime()) {
      const refreshTokenExpiration = session?.user.tokenDetails?.refreshTokenExpires
      const refreshToken = session?.user.tokenDetails?.refreshToken

      console.log(
        '🚀 ~ constupdateTokenIfNecessary:BeforeRequestHook= ~ refreshToken:',
        refreshToken
      )

      const token = session?.user.tokenDetails?.accessToken

      if (refreshToken !== undefined && refreshTokenExpiration !== undefined) {
        const refreshTokenExpirationDate = new Date(refreshTokenExpiration)

        if (nowUTC > refreshTokenExpirationDate.getTime()) {
          await signOut()
          reset()
        } else {
          const response = await ky(`${baseApiUrl}/api/v2/token`, {
            headers: {
              Authorization: `bearer ${token}`,
            },
            json: {
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            },
            method: 'post',
            timeout: 45000,
          }).json<RefreshTokenResponse>()
          if (session?.user?.tokenDetails?.refreshToken) {
            session.user.tokenDetails.accessToken = response.access_token
            session.user.tokenDetails.expires = response['.expires']
            session.user.tokenDetails.expiresIn = response.expires_in
            session.user.tokenDetails.refreshToken = response.refresh_token
            session.user.tokenDetails.issued = response['.issued']

            session.user.tokenDetails.refreshTokenExpires = response['.refresh_token_expires']

            await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                csrfToken: await getCsrfToken(),
                data: session,
              }),
            })
          }

          if (!!response.access_token && !!response.refresh_token) {
            request.headers.set('Authorization', `Bearer ${response.access_token}`)

            // ! TODO: Update Next Auth session.
          }
          if (response.result == false) {
            await signOut()
            reset()
            window.location.href = '/sign-in'
          }
        }
      } else {
        await signOut()
        reset()
      }
    }
  }
}

export const api = ky.create({ prefixUrl: `${baseApiUrl}/api` }).extend({
  hooks: {
    beforeRequest: [addTowerKeyAndAuthHeaders, updateTokenIfNecessary],
  },
  timeout: 15000, // 15 seconds.
})

export const noHooksApi = ky.create({ prefixUrl: `${baseApiUrl}/api` }).extend({
  timeout: 15000, // 15 seconds.
})

export const localApi = ky.create({ prefixUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api` })
