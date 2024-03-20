import { useRouter } from 'next/router'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import CryptoJS from 'crypto-js'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CHECKOUT_CONFIRMATION_PAGE_PATH } from '@/lib/paths'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useConsultantQuery } from '@/lib/queries/consultant'
import {
  useCheckoutActions,
  useCheckoutActiveShippingAddress,
  useCheckoutAppliedSkyWallet,
  useCheckoutCvv,
  useCheckoutGuestAddress,
  useCheckoutSelectedPickUpAddress,
} from '@/lib/stores/checkout'
import { Receipt, useReceiptActions } from '@/lib/stores/receipt'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Failure, Success } from '@/lib/types'
import { clearLoading, toastError, toastLoading, toastSuccess } from '@/lib/utils/notifications'

type PayForOrderResponse = Success | Failure

interface PayForOrderOptions {
  appliedSkyWallet?: number
  cartId: string
  consultantUrl?: string
  cvv: string
}

export const payForOrder = async ({
  appliedSkyWallet = 0,
  cartId,
  consultantUrl = 'shop',
  cvv,
}: PayForOrderOptions) => {
  try {
    const response = await api('v2/checkout/PayForOrder', {
      json: {
        CVV: CryptoJS.AES.encrypt(cvv, process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || '').toString(),
        CartID: cartId,
        EventDisplayID: '',
        ReplicatedSiteUrl: consultantUrl,
        SkyWalletAmount: appliedSkyWallet,
      },
      method: 'post',
    }).json<PayForOrderResponse>()

    if (!response.Success) {
      clearLoading()
      throw new Error(response.Error.Message)
    }
    clearLoading()
  } catch (error: unknown) {
    clearLoading()
    const { message } = error as { message: string }
    toastError({
      message: message || 'There was an error placing your order. Please try again later.',
    })
    throw new Error((error as string) || 'There was an error placing the order.')
  }
}

const signOutServerSide = async () => {
  try {
    const csrf = await api('/api/auth/csrf', { method: 'get' }).json<string>()
    const formData = new FormData()
    formData.append('csrfToken', csrf)
    await api('/api/auth/signout', { body: formData, method: 'post' })
  } catch {
    //
  }
}

const PAY_FOR_ORDER_MUTATION_KEY = 'pay-for-order'
export const useCheckoutPayForOrderMutation = (cartTotalData: any) => {
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const appliedSkyWallet = useCheckoutAppliedSkyWallet()
  const guestAddress = useCheckoutGuestAddress()
  const cvv = useCheckoutCvv()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: cart } = useCartQuery()
  const { data: subTotal } = useGetSubtotalQuery()

  console.log('🚀 ~ useCheckoutPayForOrderMutation ~ subTotal:', subTotal)
  console.log('🚀 ~ useCheckoutPayForOrderMutation ~ cartTotalData:', cartTotalData)

  const { data: consultant } = useConsultantQuery()
  const { data: session } = useSession()
  const { reset } = useCheckoutActions()
  const { setReceipt } = useReceiptActions()
  const { shippingState } = useShippingStateStore()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()

  return useMutation<unknown, Failure, Partial<PayForOrderOptions> | Record<string, never>>({
    mutationFn: options =>
      payForOrder({
        ...options,
        appliedSkyWallet,
        cartId: cart?.id || '',
        consultantUrl: consultant?.url,
        cvv,
      }),
    mutationKey: [PAY_FOR_ORDER_MUTATION_KEY],
    onMutate: () => {
      toastLoading({ message: 'Placing your order...' })
    },
    onSuccess: async () => {
      toastSuccess({ message: 'Your order has been placed successfully!' })
      const address = guestAddress || activeShippingAddress
      const checkoutReceipt: Receipt = {
        cartItems: cart?.items || [],
        consultantDisplayId:
          consultant?.displayId !== CORPORATE_CONSULTANT_ID ? consultant.displayId : undefined,
        deliveryAddress: {
          addressLineOne: address?.Street1,
          addressLineTwo: address?.Street2,
          city: address?.City,
          company: address?.Company,
          firstName: address?.FirstName,
          lastName: address?.LastName,
          state: address?.ProvinceAbbreviation,
          zipCode: address?.PostalCode,
        },
        deliveryMethodDisplayName: cartTotalData?.shipping.displayName || '',
        discounts: subTotal?.discountTotals ?? subTotal?.discounts ?? [],
        isSharedCart: cart?.isSharedCart || false,
        orderDisplayId: cart?.orderDisplayId,
        prices: {
          appliedSkyWallet: 0,
          retailDeliveryFee: cartTotalData?.retailDeliveryFee || 0,
          salesTax: cartTotalData?.tax || 0,
          shipping: cartTotalData?.shipping.price || 0,
          subtotal: cartTotalData?.subtotal || 0,
          subtotalAfterSavings: cartTotalData?.subtotalAfterSavings || 0,
        },
      }
      if (selectedPickUpAddress !== undefined) {
        await api('v2/checkout/SaveLastUsedAddress', {
          json: {
            data: selectedPickUpAddress,
          },
          method: 'post',
        })
      }
      reset()

      setReceipt(checkoutReceipt)
      queryClient.invalidateQueries([
        ...CART_QUERY_KEY,
        shippingState.provinceID || session?.user?.shippingState?.provinceID,
      ])
      await signOutServerSide()
      router.push(CHECKOUT_CONFIRMATION_PAGE_PATH)
    },
  })
}
