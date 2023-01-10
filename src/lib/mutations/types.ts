import { Failure } from '../types'

export interface CartResponse {
  Success: boolean
  Data: {
    OrderID: number
    DisplayID: string
    OrderDate: string
    EventDisplayID: string
    Subtotal: number
    OrderLines: {
      DisplayPrice: number
      Price: number
      Quantity: number
      ProductDisplayName: string
      ProductSKU: string
      ProductImage: string
      OrderLineID: number
      OrderID: number
    }[]
    DiscountTotals: {
      TotalDescription: string
      TotalAmount: number
    }[]
  }
}

interface CartModificationResponseSuccess {
  Success: true
  CartID: string
  Data: {
    Cart: CartResponse
  }
}

export type CartModificationResponse = CartModificationResponseSuccess | Failure
