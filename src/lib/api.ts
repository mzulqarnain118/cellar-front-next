import ky, { BeforeRequestHook } from 'ky'
import { getSession } from 'next-auth/react'

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

  if (
    request.method === 'POST' &&
    (request.body instanceof Object || Array.isArray(request.body))
  ) {
    request.headers.set('Content-Type', 'application/json')
  }
}

export const api = ky.create({ prefixUrl: `${baseApiUrl}/api` }).extend({
  hooks: {
    beforeRequest: [addTowerKeyAndAuthHeaders],
  },
  timeout: 15000, // 15 seconds.
})

export const localApi = ky.create({ prefixUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api` })
