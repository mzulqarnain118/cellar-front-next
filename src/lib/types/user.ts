import { State } from './state'

interface UserConsultantData {
  displayId: string
  displayName: string
  url: string
}
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
  personId: number
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
  userConsultantData?: UserConsultantData
}
