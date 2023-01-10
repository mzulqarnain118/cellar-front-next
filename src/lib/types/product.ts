import { Camelize } from '@/core/utils'

import { Failure } from '.'

interface ProductSchema {
  sku: string | null
  cartUrl: string | null
  displayName: string | null
  categoriesIDs: number[] | null
  catalogID: number | null
  description: string | null
  price: number | null
  comparePrice: string | null
  pictureUrl: string | null
  subscribable: boolean | null
  quantityAvailable: number | null
  attributes:
    | {
        name: ProductAttribute
        value: string
      }[]
    | null
  displayCategories:
    | {
        displayCategoryID: number | null
        displayOrder: number | null
      }[]
    | null
    | null
  variations:
    | {
        SKU: string | null
        Primary: boolean | null
        Active: boolean | null
      }[]
    | null
    | null
  availability:
    | {
        ProvinceID: number | null
        Name: string | null
        Enabled: boolean | null
        Abbr: string | null
      }[]
    | null
    | null
}

export type Product = Camelize<ProductSchema>

export type ProductAttribute =
  | 'Brand'
  | 'Origin'
  | 'SubType'
  | 'Varietal'
  | 'AutoSip Base SKU'
  | 'Container Size'
  | 'Pairing Notes'
  | 'Tasting Notes'
  | 'Vintage'

interface ProductsSuccessResponse {
  Success: true
  Data?: {
    NextPageUrl: string
    Page: number
    PreviousPageUrl: string
    TotalNumberOfPages: number
    TotalNumberOfProducts: number
    Products: {
      Availability: {
        Abbr: string
        Enabled: boolean
        Name: string
        ProvinceID: number
      }[]
      CartUrl: string
      CatalogID: number
      CategoriesIDs?: number[]
      DisplayName: string
      SKU: string
      Description?: string
      Price: number
      ComparePrice: string
      PictureUrl?: string
      HasVariations: boolean
      Subscribable: boolean
      QuantityAvailable: number
      DisplayCategories?: {
        DisplayCategoryID: number
        DisplayOrder: number
      }[]
      Variations?: {
        SKU: string
        Primary: boolean
        Active: boolean
      }[]
    }[]
  }
}

export type ProductsResponse = ProductsSuccessResponse | Failure
