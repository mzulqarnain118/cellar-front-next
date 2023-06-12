declare module 'linc-web-chat' {
  interface LincOptions {
    publicId: string
    locale: string
    embedded?: string
    storeKey?: string
    shopperEmail?: string
    shopperEmailHash?: string
    pageContext?: {
      pageCategory: string
      productsInfo: {
        variantId: string
        productId: string
        name: string
        category: string
      }[]
    }
    greetingConfig?: {
      intro: string
      getStartedButton: string
    }
  }

  interface LincWebChat {
    init: (options: LincOptions) => void
  }
  /**
   * Linc web chat object.
   */
  export const LincWebChat: LincWebChat
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LincWebChat: LincWebChat
