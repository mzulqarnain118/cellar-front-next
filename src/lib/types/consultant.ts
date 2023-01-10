export interface Consultant {
  address?: {
    city?: string
    country?: string
    stateAbbreviation?: string
    zipCode?: string
  }
  displayId: string
  displayName: string
  emailAddress?: string
  imageUrl?: string
  phoneNumber?: string
  profileMessage?: string
  profileWebsite?: string
  socialLinks?: {
    baseUrl: string
    name: string
    url: string
  }[]
  url: string
}
