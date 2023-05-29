import { Failure } from '@/lib/types'

export interface VIPCart {
  CartID: string
  cart_information: {
    DiscountTotals: {
      TotalAmount: number
      TotalDescription: string
    }[]
    DisplayID: string
    OrderLines: {
      ProductSKU: string
      Price: number
      DisplayPrice: number
      Quantity: number
      ProductImage: string
      ProductClassificationIDs: number[]
      ProductDisplayName: string
      OrderLineID: number
      OrderID: number
      CategoriesIDs: number[]
      Variations: {
        SKU: string
        cartUrl: string
        Primary: boolean
        Active: boolean
        ProductVariations: {
          VariationTypeID: number
          VariationTypeName: string
          VariationTypeOptionID: number
          VariationOptionName: string
        }[]
      }[]
    }[]
    Subtotal: number
    SubtotalAfterSavings: number
    TaxTotal: number
  }
}

interface VIPCartSuccess {
  Success: true
  Data: VIPCart
}

export type VIPCartResponse = VIPCartSuccess | Failure
