export enum currenyCode {
  USD = 'USD',
}

export interface trackEventData {
  event: string
  ecommerce?: eComType
  dimension?: dimension
  parameterName?: string
  parameterValue?: string
}

/** Ecommerce object field names are according to the recommended nomunclature by GA4 */
export interface ecomItem {
  item_id: string
  item_name: string
  affiliation?: string
  coupon?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string //filter categories & tags for products
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string // plp, related products etc
  item_list_name?: string | undefined
  item_variant?: string
  price: number
  quantity?: number
}

export interface eComType {
  currency: currenyCode
  value?: number
  coupon?: string
  items: [ecomItem]
}

export interface dimension {
  [DimensionType: string]: string
}
