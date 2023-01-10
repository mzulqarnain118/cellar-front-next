import { CartItem, Product } from './types'

export const convertProductToCartItem = (product: Product): CartItem => ({
  attributes: product.attributes || [],
  cartUrl: product.cartUrl || '',
  imageUrl: product.pictureUrl || '',
  isAutoShip: false,
  isClubOnly: false,
  isGift: false,
  isGiftCard: false,
  isMerch: false,
  isScoutCircleClub: false,
  name: product.displayName || '',
  orderId: 0, // * NOTE: Determined once added to cart.
  orderLineId: 0, // * NOTE: Determined once added to cart.
  price: product.price || 0,
  quantity: 1,
  sku: product.sku || '',
  stateAvailability:
    product.availability?.map(state => ({
      abbreviation: state.Abbr || 'TX',
      countryID: 1,
      enabled: !!state.Enabled,
      name: state.Name || 'Texas',
      provinceID: state.ProvinceID || 48,
    })) || [],
  subscribable: false,
})
