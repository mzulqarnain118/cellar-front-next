import { Failure } from '../types'

export interface CartProductOrderLine {
  ComparePrice: number
  DisplayPrice: number
  OrderID: number
  OrderLineID: number
  Price: number
  ProductCartUrl: string
  ProductDisplayName: string
  ProductImage: string
  ProductSKU: string
  Quantity: number
}

export interface CartResponse {
  Success: boolean
  Data: {
    OrderID: number
    DisplayID: string
    OrderDate: string
    EventDisplayID: string
    Subtotal: number
    OrderLines: CartProductOrderLine[]
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
  data?: {
    cart: {
      OrderLines: CartProductOrderLine[]
      Subtotal: number
      SubtotalAfterSavings: number
      TaxTotal: number
    }
  }
}

export type CartModificationResponse = CartModificationResponseSuccess | Failure
