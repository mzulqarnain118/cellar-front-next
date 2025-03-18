import { useEffect, useMemo, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import {
  ADDRESS_CREDIT_CARDS_QUERY_KEY,
  ShippingAddressesAndCreditCards,
  getShippingAddressesAndCreditCards,
} from '@/lib/queries/checkout/addreses-and-credit-cards'
import { GET_SUBTOTAL_QUERY } from '@/lib/queries/checkout/get-subtotal'
import { SHIPPING_METHODS_QUERY_KEY } from '@/lib/queries/checkout/shipping-methods'
import { useStatesQuery } from '@/lib/queries/state'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart, Failure } from '@/lib/types'
import { Address } from '@/lib/types/address'
import { toastInfo } from '@/lib/utils/notifications'
import { useRouter } from 'next/router'

export const APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY = ['apply-checkout-selections']

export interface ApplyCheckoutSelectionsOptions {
  address?: Address
  addressId: number
  cartId?: string
  paymentToken?: string
  userDisplayId?: string
  setError?: (error: string) => void
}

type Response = { Success: true } | Failure
export const applyCheckoutSelections = async ({
  addressId,
  cartId,
  paymentToken,
  userDisplayId,
  setError,
}: ApplyCheckoutSelectionsOptions) => {
  try {
    localStorage.setItem('loading', 'true')
    const response = await api('v2/checkout/ApplyCheckoutSelectionsWeb', {
      json: {
        addressId,
        billingOption: '2',
        paymentMethodID: 1,
        paymentToken,
        personDisplayId: userDisplayId || '',
        personTypeId: 2,
        shippingOption: 2,
      },
      method: 'post',
      searchParams: { cartId: cartId || '' },
    }).json<Response>()

    if (!response.Success) {
      setError?.(response.Error.Message)
    }
    localStorage.removeItem('loading')
    return response
  } catch {
    localStorage.removeItem('loading')
    throw new Error('There was an error applying the checkout selections.')
  }
}

export const useApplyCheckoutSelectionsMutation = () => {
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const { data: cart } = useCartQuery()
  const { data: session } = useSession()
  const { setShippingState, shippingState } = useShippingStateStore()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const guestAddress = useCheckoutGuestAddress()
  const { setRemovedCartItems } = useCheckoutActions()
  const { setActiveCreditCard, setActiveShippingAddress } = useCheckoutActions()
  const router = useRouter()
  const address = useMemo(
    () => (session?.user?.isGuest ? guestAddress : activeShippingAddress),
    [activeShippingAddress, guestAddress, session?.user?.isGuest]
  )
  const { data: states } = useStatesQuery()
  const cartProvinceId = useMemo(() => shippingState?.provinceID, [shippingState?.provinceID])

  useEffect(() => {
    if (error) {
      localStorage.removeItem('cart')
      queryClient.invalidateQueries([...CART_QUERY_KEY, cartProvinceId])
      toastInfo({
        message: error,
      })
      router.push(HOME_PAGE_PATH)
    }
  }, [error])


  return useMutation<Response, Error, Partial<ApplyCheckoutSelectionsOptions>>({
    mutationFn: async data => {
      if (localStorage.getItem('loading')) {
        return Promise.reject(new Error('Request aborted because query is already running'))
      }
      return applyCheckoutSelections({
        ...data,
        addressId: data.addressId || address?.AddressID || 0,
        cartId: data.cartId || cart?.id,
        paymentToken: data.paymentToken || activeCreditCard?.PaymentToken,
        userDisplayId: data.userDisplayId || session?.user?.displayId,
        setError,
      })
    },
    mutationKey: [...APPLY_CHECKOUT_SELECTIONS_MUTATION_KEY],
    onSuccess: async (response, data) => {
      if (response?.Success) {
        const addressesAndCreditCards =
          await queryClient.ensureQueryData<ShippingAddressesAndCreditCards | null>({
            queryFn: getShippingAddressesAndCreditCards,
            queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, session?.user?.isGuest],
          })

        let correspondingAddress

        if (data.address) {
          correspondingAddress = data.address
        } else {
          correspondingAddress =
            addressesAndCreditCards?.addresses.find(
              address => address.AddressID === data.addressId
            ) ||
            addressesAndCreditCards?.userPickUpAddresses.find(
              address => address?.Address?.AddressID === data.addressId
            )
        }

        if (correspondingAddress && correspondingAddress.Address) {
          correspondingAddress = correspondingAddress.Address
        }

        let correspondingCreditCard = addressesAndCreditCards?.creditCards.find(
          creditCard => creditCard.PaymentToken === data.paymentToken
        )

        if (correspondingAddress === undefined || correspondingCreditCard === undefined) {
          const altAddressesAndCreditCards =
            await queryClient.ensureQueryData<ShippingAddressesAndCreditCards | null>({
              queryFn: getShippingAddressesAndCreditCards,
              queryKey: [ADDRESS_CREDIT_CARDS_QUERY_KEY, cart?.id, session?.user?.isGuest],
            })

          if (data.address) {
            correspondingAddress = address
          } else {
            correspondingAddress =
              addressesAndCreditCards?.addresses.find(
                address => address.AddressID === data.addressId
              ) ||
              addressesAndCreditCards?.userPickUpAddresses.find(
                address => address?.Address?.AddressID === data.addressId
              )
          }

          if (correspondingAddress && correspondingAddress.Address) {
            correspondingAddress = correspondingAddress.Address
          }

          correspondingCreditCard = altAddressesAndCreditCards?.creditCards.find(
            creditCard => creditCard.PaymentToken === data.paymentToken
          )
        }

        if (
          cart !== undefined &&
          parseInt(correspondingAddress?.ProvinceID || shippingState.provinceID?.toString()) !==
            shippingState.provinceID
        ) {
          const removedCartItems: Cart['items'] = []
          cart.items.forEach(product => {
            const availability = product.availability?.filter(
              state =>
                state.provinceId ===
                  (correspondingAddress?.ProvinceID
                    ? parseInt(correspondingAddress?.ProvinceID)
                    : shippingState.provinceID) && state.enabled
            )
            if (availability === undefined || availability.length === 0) {
              removedCartItems.push(product)
            }
          })

          if (removedCartItems.length > 0) {
            setRemovedCartItems(removedCartItems)
            return
          }
        }

        setActiveShippingAddress(correspondingAddress)
        setActiveCreditCard(correspondingCreditCard)

        if (
          correspondingAddress !== undefined &&
          parseInt(correspondingAddress.ProvinceID) !== shippingState.provinceID
        ) {
          const newState = states?.find(
            state => state.provinceID.toString() === correspondingAddress?.ProvinceID?.toString()
          )
          setShippingState(
            newState || {
              abbreviation: correspondingAddress.ProvinceAbbreviation,
              countryID: 1,
              enabled: true,
              name: correspondingAddress.ProvinceName,
              provinceID: parseInt(correspondingAddress.ProvinceID),
            }
          )
        }
      }


      await queryClient.invalidateQueries([GET_SUBTOTAL_QUERY, cart?.id])
      await queryClient.invalidateQueries({
        queryKey: [SHIPPING_METHODS_QUERY_KEY],
      })
    },
  })
}
