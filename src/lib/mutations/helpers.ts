import { api } from '../api'
import { Cart, CartItem, Failure } from '../types'

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
  originalCartItems: CartItem[],
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
  items: {
    DisplayPrice: number
    Price: number
    Quantity: number
    ProductDisplayName: string
    ProductSKU: string
    ProductImage: string
    OrderLineID: number
    OrderID: number
  }[],
  originalCartItems: CartItem[]
): CartItem[] =>
  items
    .map(
      ({
        DisplayPrice,
        OrderID,
        OrderLineID,
        Price,
        ProductDisplayName,
        ProductImage,
        ProductSKU,
        Quantity,
      }) => {
        const correspondingItem = originalCartItems.find(item => item.sku === ProductSKU)
        const item: {
          imageUrl: string
          name: string
          onSalePrice: number
          orderId: number
          orderLineId: number
          price: number
          quantity: number
          sku: string
        } = {
          imageUrl: ProductImage,
          name: ProductDisplayName,
          onSalePrice: DisplayPrice,
          orderId: OrderID,
          orderLineId: OrderLineID,
          price: Price,
          quantity: Quantity,
          sku: ProductSKU,
        }

        if (correspondingItem !== undefined) {
          return {
            ...correspondingItem,
            ...item,
          }
        }

        return item
      }
    )
    .filter((value?: object): value is CartItem => !!value && 'sku' in value) as CartItem[]
