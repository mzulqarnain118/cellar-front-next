import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { api } from '../api'
import { useCartStorage } from '../hooks/use-cart-storage'
import { useTastingEventStorage } from '../hooks/use-tasting-storage'
import { useShippingStateStore } from '../stores/shipping-state'
import { Cart, Tasting } from '../types'

interface CreateCartOptions {
  cartId?: string
  cartItems?: Cart['items']
  isLoggedIn?: boolean
  orderDisplayId?: string
  provinceId?: number
}

export interface SetTastingOptions {
  cartId?: string | undefined | string[]
  consultantDisplayId: string
  u?: string | string[] | undefined
  //   show?: boolean
  eventshare?: string | undefined | string[]
}

export interface GetConsultantDetailsResponse {
  City: string
  CountryName: string
  DisplayID?: string
  DisplayName: string
  EmailAddress?: string
  ImageURL?: string
  PhoneNumber: string
  PostalCode: string
  ProfileMessage: string
  ProfileWebsite?: string
  ProvinceAbbreviation: string
  SocialLinks: {
    LinkBaseURL: string
    LinkName: string
    URL: string
  }[]
  Url: string
}

export interface ValidateTastingAndUpdateCartResponse {
  Value: {
    DisplayID: string
    EventName: string
    EventDateTime: string
    HostFirstName: string
    HostLastName: string
  }
}

// const tastingPromise = async (
//   u: string | string[] | undefined,
//   eventshare: string | string[] | undefined
// ) =>
//   await new Promise(resolve => {
//     resolve({
//       consultantUrl: u || 'abs',
//       eventId: eventshare || '',
//       show: true,
//     })
//   })

export const setTasting = async (data: SetTastingOptions): Promise<Tasting | null> => {
  const searchParams = new URLSearchParams()

  if (data.cartId !== undefined) {
    searchParams.set(
      'cartId',
      Array.isArray(data.cartId) ? data.cartId.join(',') : data.cartId?.toString()
    )
  }

  if (data.u !== undefined) {
    searchParams.set(
      'consultantDisplayID',
      Array.isArray(data.u) ? data.u.join(',') : data.u?.toString()
    )
  }

  if (data.eventshare !== undefined) {
    searchParams.set(
      'eventDisplayId',
      Array.isArray(data.eventshare) ? data.eventshare?.join(',') : data.eventshare?.toString()
    )
  }

  const response: Tasting | null = await api('shopping/ValidatePartyAndUpdateCart', {
    method: 'post',
    searchParams: {
      cartId: data.cartId,
      consultantDisplayID: data.consultantDisplayId || '',
      eventDisplayId: data.eventshare,
    },
  }).json()

  return response
}

export const createCart = async (options?: CreateCartOptions): Promise<Cart> => {
  const newCartItems =
    options?.cartItems?.map(({ sku, quantity }) => ({ Quantity: quantity, SKU: sku })) || []

  const response = await api('shop/CreateCart', {
    json: { LineItems: newCartItems || [] },
    method: 'post',
    searchParams: {
      provinceId: options?.provinceId || 48,
      sessionId: '',
    },
  }).json<{ CartID: string }>()

  return {
    discounts: [],
    id: response.CartID,
    items: options?.cartItems || [],
    prices: {
      orderTotal: 0,
      retailDeliveryFee: 0,
      shipping: 0,
      subtotal: 0,
      subtotalAfterSavings: 0,
      tax: 0,
    },
  }
}

export const CART_QUERY_KEY = ['cart']
export const TASTING_QUERY_KEY = ['tasting']

export const useCartQuery = (provinceId?: number) => {
  const { shippingState } = useShippingStateStore()
  const [cartStorage, setCartStorage] = useCartStorage()
  const cartProvinceId = useMemo(
    () => provinceId || shippingState?.provinceID,
    [provinceId, shippingState?.provinceID]
  )

  return useQuery({
    cacheTime: Infinity,
    initialData: cartStorage,
    meta: {
      persist: true,
    },
    onSuccess: response => {
      setCartStorage(response)
    },
    queryFn: () => createCart({ provinceId: cartProvinceId }),
    queryKey: [...CART_QUERY_KEY, cartProvinceId],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })
}

export const useTastingQuery = ({ cartId, consultantDisplayId, eventshare, u }) => {
  const [_, setTastingStorage] = useTastingEventStorage()

  const queryKey = ['tasting', consultantDisplayId, u, cartId]
  return useQuery({
    queryFn: setTasting({ cartId, consultantDisplayId, eventshare, u }),
    onError: err => console.log(err),
    onSuccess: response => {
      setTastingStorage(response)
    },
    queryKey,
    refetchOnWindowFocus: false,
    enabled: false,
  })
}
