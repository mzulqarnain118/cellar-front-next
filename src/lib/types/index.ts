export interface Success {
  Success: true
}

export interface Failure {
  Success: false
  Error: {
    Code: string
    Message: string
    Traceback?: Record<string, unknown> & {
      Notifications?: {
        Message?: string
      }[]
    }
  }
}

export * from './cart'
export * from './consultant'
export * from './curated-cart'
export * from './product'
export * from './state'
export * from './user'
