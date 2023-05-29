import { Failure } from '@/lib/types'

interface SaveSharedCartSuccess {
  Success: true
  ShortLinkUrl: string
}

export type SaveSharedCartResponse = SaveSharedCartSuccess | Failure

interface GetSharedCartSuccess {
  Success: true
  Data: {
    Cart: {
      Subtotal: number
      SubtotalAfterSavings: number
      TaxTotal: number
      DisplayID: string
      OrderLines: {
        ProductSKU: string
        Price: number
        DisplayPrice: number
        Quantity: number
        ProductImage: string
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
    }
    CartId: string
  }
}

export type GetSharedCartResponse = GetSharedCartSuccess | Failure
