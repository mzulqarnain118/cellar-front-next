/*
 * Scout & Cellar
 * https://www.scoutandcellar.com
 *
 * Helper class for Google Tag Manager-related functionality.
 */

import { GtmECommerceEvents } from '../constants/gtm-events'
import { CartItem, CheckoutThanksData, SubscriptionProduct } from '../types'
import { currenyCode, eComType, ecomItem } from '../types/gtm-types'

import { trackEvent } from './gtm-service'

// App dependencies

/*The Implementation for each functionality in the application related to GTM*/

/**
 * Track PLP list Add To Carts
 *
 * @param {[SubscriptionProduct | CartItem]} products
 */
export const trackPlpListProducts = (products: [SubscriptionProduct | CartItem]) => {
  const items: ecomItem[] = []
  for (let index = 0; index < products.length; index++) {
    items.push({
      index: index + 1,
      item_brand: products[index].attributes?.Brand,
      item_id: products[index].sku,
      item_name: products[index].displayName,
      price: products[index].price,
    })
  }
  const ecommerce: eComType = {
    currency: currenyCode.USD,
    items,
  }
  trackEvent({
    ecommerce,
    event: GtmECommerceEvents.VIEW_ITEM_LIST,
  })
}

/**
 * Track Products add to cart with quantity defaults to 1
 *
 * @param {SubscriptionProduct | CartItem}product
 * @param {number} quantity
 *
 */
export const trackProductAddToCart = (product: SubscriptionProduct | CartItem, quantity = 1) => {
  const items: [ecomItem] = [
    {
      item_brand: product.attributes?.Brand,
      item_id: product.sku,
      item_name: product.displayName,
      price: product.price,
      quantity,
    },
  ]
  const ecommerce: eComType = {
    currency: currenyCode.USD,
    items,
    value: product.price,
  }

  trackEvent({
    ecommerce,
    event: GtmECommerceEvents.ADD_TO_CART,
  })
}

export const trackSelectedProduct = (product: SubscriptionProduct | CartItem) => {
  const ecommerce: eComType = {
    currency: currenyCode.USD,
    items: [
      {
        item_brand: product.attributes?.Brand,
        item_id: product.sku,
        item_name: product.displayName,
        price: product.price,
      },
    ],
    value: product.price,
  }
  trackEvent({
    ecommerce,
    event: GtmECommerceEvents.SELECT_ITEM,
  })
}

/**
 * Track Checkout Thanks Page
 *
 * @param checkoutThanks
 */

export const trackCheckoutThanks = (checkoutThanks: CheckoutThanksData) => {
  trackEvent({
    ecommerce: checkoutThanks,
    event: GtmECommerceEvents.CHECKOUT_THANKS,
  })
}

export const trackCheckoutBegin = (products: CartItem[], subtotal: number) => {
  const items: ecomItem[] = []
  for (let index = 0; index < products.length; index++) {
    items.push({
      item_brand: products[index].attributes?.Brand,
      item_id: products[index].sku,
      item_name: products[index].displayName,
      price: products[index].price,
    })
  }

  const ecommerce: eComType = {
    currency: currenyCode.USD,
    items,
    value: subtotal,
  }

  trackEvent({
    ecommerce,
    event: GtmECommerceEvents.BEGIN_CHECKOUT,
  })
}

/**
 * Track Product View on Page Load
 *
 * @param product
 */
export const trackProductView = (product: CartItem | SubscriptionProduct) => {
  const ecommerce: eComType = {
    currency: currenyCode.USD,
    items: [
      {
        item_brand: product.attributes?.Brand,
        item_id: product.sku,
        item_name: product.displayName,
        price: product.price,
      },
    ],
    value: product.price,
  }
  trackEvent({
    ecommerce,
    event: GtmECommerceEvents.VIEW_ITEM,
  })
}
