import { ProductAttribute, State } from '.'

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

export interface CartItem {
  attributes: {
    name: ProductAttribute
    value: string
  }[]
  cartUrl: string
  categoryName?: string
  imageUrl: string
  isAutoShip: boolean
  isClubOnly: boolean
  isGift: boolean
  isGiftCard: boolean
  isMerch: boolean
  isScoutCircleClub: boolean
  name: string
  onSalePrice?: number
  orderLineId: number
  orderId: number
  parentSku?: string
  price: number
  quantity: number
  selectedVariation?: ProductVariation
  sku: string
  stateAvailability: State[]
  subscribable: boolean
  variations?: Variation[]
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
