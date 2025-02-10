/**
 * Generate brand click event.
 * @param name Brand name
 */
export const generateGtmBrandClick = (name: string) => {
  window.dataLayer = window.dataLayer || []
  const dataLayerObject = {
    event: 'GA-Single-Brand-Page',
    singleBrandName: name,
  }
  window.dataLayer.push(dataLayerObject)
}

/**
 * Generate generic event with data to catch in GTM.
 * @param eventName Event to be lauched
 * @param data GTM Json Data
 */
export const generateGtmEventWithData = (eventName: string, data?: unknown) => {
  window.dataLayer = window.dataLayer || []
  const dataLayerObject = {
    event: eventName,
    data, // Currently it's been handled by GTM to receive the type of data we need
  }
  window.dataLayer.push(dataLayerObject)
}
