/*
 * Scout & Cellar
 * https://www.scoutandcellar.com
 *
 * Helper class for Google Tag Manager-related functionality.
 */

import { GtmECommerceEvents } from "../constants/gtm-events";
import { CartItem, SubscriptionProduct } from "../types";
import { currenyCode, eComType, ecomItem } from "../types/gtm-types";
import { trackEvent } from "./gtm-service";


// App dependencies

/*The Implementation for each functionality in the application related to GTM*/


/**
 * Track PLP list Add To Carts
 * 
 * @param {[SubscriptionProduct | CartItem]} products 
 */
export const trackPlpListProducts = (products: [SubscriptionProduct | CartItem]) => {
    let items!: [ecomItem];
    for (let index = 0; index < products.length; index++) {
        items?.push({
            item_id: products[index].sku,
            item_name: products[index].displayName,
            price: products[index].price,
            affiliation: products[index].isAutoSip ? "AutoSip" : products[index].isClubOnly ? "Club Only" : products[index].isScoutCircleClub ? "Scout Circle CLub" : "",
            index,
        })
    }
    const ecommerce: eComType = {
        currency: currenyCode.USD,
        items,
    }
    trackEvent({
        ecommerce,
        event: GtmECommerceEvents.VIEW_ITEM_LIST
    })
}

/**
 * Track Products add to cart with quantity defaults to 1
 * 
 * @param {SubscriptionProduct | CartItem}product 
 * @param {number} quantity 
 * 
 */
export const trackProductAddToCart = (product: SubscriptionProduct | CartItem, quantity: number = 1) => {
    const items: [ecomItem] = [{
        item_id: product.sku,
        item_name: product.displayName,
        price: product.price,
        quantity,
    }]
    const ecommerce: eComType = {
        currency: currenyCode.USD,
        value: product.price,
        items
    }

    trackEvent({
        ecommerce,
        event: GtmECommerceEvents.VIEW_ITEM_LIST,

    })
}


export const trackSelectedProduct = (product: SubscriptionProduct | CartItem) => {

    const ecommerce: eComType = {
        currency: currenyCode.USD,
        value: product.price,
        items: [{
            item_id: product.sku,
            item_name: product.displayName,
            price: product.price
        }]
    }
    trackEvent({
        event: GtmECommerceEvents.SELECT_ITEM,
        ecommerce
    })
}