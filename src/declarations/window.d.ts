interface Window {
  toggleDevtools: () => void
  Brightback: {
    cancel: (event: MouseEvent) => void
  }
  dataLayer?: object[]
  lincWebChatAsyncInit?: () => void
  LincWebChat: {
    linkEmail: (email: string, hash: string) => void
    reload: (properties: object) => void
    unlinkEmail: () => void
  }
}
