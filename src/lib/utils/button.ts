import { CartItem, SubscriptionProduct } from '../types'

export const getProductButtonText = (
  product: SubscriptionProduct | CartItem,
  isUserClubMember = false
) => {
  if (
    (product.variations !== undefined && product.variations.length > 0) ||
    product.subscriptionProduct !== undefined
  ) {
    return 'Details'
  } else if (!product.isClubOnly || isUserClubMember) {
    return 'Add to Cart'
  }

  return 'Join the Circle'
}
