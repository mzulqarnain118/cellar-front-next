/*
 * Scout & Cellar
 * https://www.scoutandcellar.com
 *
 * Utility class for Google Tag Manager-related functionality.
 */

import { trackEventData } from '../types/gtm-types';

/**
 * Send custom event to GTM/GA.
 *
 * @param {string} event
 * @param {string} parameterName
 * @param {string} parameterValue
 */
export const trackEvent = (eventData: trackEventData) => {
  if (!isTrackingEnabled()) {
    return
  }
    getDataLayer()?.push(eventData)
}

/**
 * Returns the GTM data layer, if enabled, enabled for this environment.
 *
 * @returns {{}}
 */
function getDataLayer() {
    window.dataLayer?.push({ ecommerce: null });  // Clear the previous ecommerce object.)
    return window.dataLayer //TagManager.dataLayer(eventConfig)
}

/**
 * Returns true if tracking is enabled.
 *
 * @returns {boolean}
 */
function isTrackingEnabled() {
  return !!getDataLayer()
}
