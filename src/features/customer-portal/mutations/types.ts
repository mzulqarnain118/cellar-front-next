interface Notifications {
  Notifications: { Message: string }[]
}

export interface Response extends Notifications {
  hasError: boolean
  response: { data: { Message: string } & Notifications }
}
