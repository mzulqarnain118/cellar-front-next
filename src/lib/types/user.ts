export interface User {
  displayId: string
  tokenDetails?: {
    accessToken: string
    issued: string
    expires: string
    expiresIn: number
    refreshToken: string
    refreshTokenExpires: string
  }
  email: string
  username?: string
  name: {
    first: string
    last: string
  }
  isClubMember: boolean
  dateOfBirth?: Date
}
