import { State } from './state'

export interface User {
  displayId: string
  dateOfBirth?: Date
  email: string
  fullName: string
  isClubMember: boolean
  name: {
    first: string
    last: string
  }
  isGuest: boolean
  shippingState: State
  token: string
  tokenDetails?: {
    accessToken: string
    issued: string
    expires: string
    expiresIn: number
    refreshToken: string
    refreshTokenExpires: string
  }
  username?: string
}
