import { Failure } from '@/lib/types'

export interface GetProductDetailsResponse {
  ProductID: number
  DisplayCategoryID: number
  ProductImage: string
  ProductSKU: string
  ProductDisplayName: string
  ProductDescription: string
  ProductVariation: string
  BasePrice: number
  Price: number
  AllowSubtotal: boolean
  SubscriptionOnly: boolean
  ComparePrice: number
  SubscriptionPrice: number
  ProductImages: {
    ImageURL: string
    DisplayOrder: number
  }[]
  QuantityAvailable: number
  VariationTypes:
    | {
        VariationTypeID: number
        Name: string
        DisplayOrder: number
        SelectedVariationTypeID: number
        VariationTypeOptions: {
          VariationTypeOptionID: number
          Name: string
          Selectable: boolean
          DisplayOrder: number
          ProductID: number
        }[]
      }[]
    | null
}

export type ProductDetails = Omit<GetProductDetailsResponse, 'VariationTypes'> & {
  Active: boolean
  Primary: boolean
  SKU: string
  VariationTypes:
    | {
        Name: string
        Options: {
          Id: number
          Name: string
          Selectable: boolean
          SKU: string
        }[]
        SelectedVariationTypeId: number
        TypeId: number
      }[]
    | null
}

interface GetProductDetailsPDPSuccess {
  Success: true
  Data: ProductDetails
}

export type GetProductDetailsPDPResponse = GetProductDetailsPDPSuccess | Failure
