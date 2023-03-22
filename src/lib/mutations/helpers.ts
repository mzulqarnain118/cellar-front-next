import { api } from '../api'
import { Cart, CartProduct, Failure } from '../types'

import { CartProductOrderLine } from './types'

interface ShippingMethod {
  ShippingMethodID: number
  DisplayName: string
  ShippingPrice: number
}

interface SubtotalData {
  Order: {
    Subtotal: number
    SubtotalAfterSavings: number
    OrderTotal: number
    Tax: number
    Shipping: number
    RetailDeliveryFee: number
    DiscountTotals: {
      TotalDescription: string
      TotalAmount: number
    }[]
    ShippingMethods: ShippingMethod[]
    ShippingMethodID: number
  }
}

interface GetSubtotalInfoSuccess {
  Success: true
  Data: SubtotalData
}

type GetSubtotalInfoResponse = GetSubtotalInfoSuccess | Failure

export const fetchSubtotalAndUpdateCart = async (
  cartId: string,
  originalCartItems: CartProduct[],
  otherCartData?: Omit<Cart, 'prices' | 'discounts' | 'id'>,
  fetchSubtotal = true
) => {
  let newCartData: Cart = {
    discounts: [],
    id: cartId,
    items: originalCartItems,
    prices: {
      orderTotal: 0,
      retailDeliveryFee: 0,
      shipping: 0,
      subtotal: 0,
      subtotalAfterSavings: 0,
      tax: 0,
    },
    ...otherCartData,
  }

  if (fetchSubtotal) {
    const subtotalResponse = await api('v2/checkout/GetSubtotalInfo', {
      searchParams: { cartId },
    }).json<GetSubtotalInfoResponse>()

    if (subtotalResponse.Success && subtotalResponse.Data) {
      const prices = subtotalResponse.Data?.Order
      newCartData = {
        ...newCartData,
        discounts: prices.DiscountTotals.map(discount => ({
          amount: discount.TotalAmount,
          description: discount.TotalDescription,
        })),
        id: cartId,
        prices: {
          orderTotal: prices.OrderTotal,
          retailDeliveryFee: prices.RetailDeliveryFee || 0,
          shipping: prices.Shipping,
          subtotal: prices.Subtotal,
          subtotalAfterSavings: prices.SubtotalAfterSavings,
          tax: prices.Tax,
        },
      }
    }
  }
  return newCartData
}

export const getNewCartItems = (
  items: CartProductOrderLine[],
  originalCartItems: CartProduct[],
  cartItem: Omit<CartProduct, 'orderLineId' | 'orderId' | 'quantity'>
): CartProduct[] =>
  items
    .map(
      ({
        ComparePrice,
        DisplayPrice,
        OrderID,
        OrderLineID,
        Price,
        ProductCartUrl,
        ProductDisplayName,
        ProductImage,
        ProductSKU,
        Quantity,
      }) => {
        const correspondingItem = originalCartItems.find(item => item.sku === ProductSKU)
        const fallbackValues = {
          catalogId: 0,
          displayCategories: [],
          isAutoShip: false,
          isClubOnly: false,
          isGift: false,
          isGiftCard: false,
          isScoutCircleClub: false,
          quantityAvailable: 0,
          subscribable: false,
        }
        const item = {
          cartUrl: ProductCartUrl,
          displayName: ProductDisplayName,
          onSalePrice: DisplayPrice || ComparePrice,
          orderId: OrderID,
          orderLineId: OrderLineID,
          pictureUrl: ProductImage,
          price: Price,
          quantity: Quantity,
          sku: ProductSKU,
        }

        if (correspondingItem !== undefined) {
          return {
            ...correspondingItem,
            ...item,
          } satisfies CartProduct
        }

        if (cartItem.sku === ProductSKU) {
          return {
            ...item,
            ...cartItem,
          } satisfies CartProduct
        }

        return { ...item, ...fallbackValues } satisfies CartProduct
      }
    )
    .filter((value?: object): value is CartProduct => !!value && 'sku' in value) as CartProduct[]
