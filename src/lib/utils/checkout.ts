import { PICK_UP_SHIPPING_METHOD_IDS } from '../constants/shipping-method'

export const isPickUpShippingMethodId = (shippingMethodId: number) =>
  PICK_UP_SHIPPING_METHOD_IDS.includes(shippingMethodId)
