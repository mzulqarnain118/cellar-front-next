import { ProductsSchema } from './schemas/product'

export interface ProductVariation {
  name: string
  primary: boolean
  selectable: boolean
  sku: string
}

export interface Variation {
  sku: string
  cartUrl: string | null
  primary: boolean | null
  active: boolean | null
  productVariations: {
    typeId: number
    typeName: string
    typeOptionId: number
    typeOptionName: string
  }[]
}

export type SubscriptionProduct = Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>

export interface CartItem extends ProductsSchema {
  subscriptionProduct?: SubscriptionProduct
  categoryName?: string
  orderLineId: number
  orderId: number
  quantity: number
  // selectedVariation?: ProductVariation
}

export interface CartDiscount {
  description: string
  amount: number
}

export interface Cart {
  id: string
  orderDisplayId?: string
  isSharedCart?: boolean
  items: CartItem[]
  discounts: CartDiscount[]
  prices: {
    subtotal: number
    subtotalAfterSavings: number
    tax: number
    shipping: number
    orderTotal: number
    retailDeliveryFee: number
  }
}

export const DEFAULT_CART_STATE: Cart = {
  discounts: [],
  id: '',
  isSharedCart: false,
  items: [],
  prices: {
    orderTotal: 0,
    retailDeliveryFee: 0,
    shipping: 0,
    subtotal: 0,
    subtotalAfterSavings: 0,
    tax: 0,
  },
}
