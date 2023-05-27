import { useRouter } from 'next/router'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import CryptoJS from 'crypto-js'

import { api } from '@/lib/api'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { CHECKOUT_CONFIRMATION_PAGE_PATH } from '@/lib/paths'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useConsultantQuery } from '@/lib/queries/consultant'
import {
  useCheckoutActions,
  useCheckoutActiveShippingAddress,
  useCheckoutCvv,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { Receipt, useReceiptActions } from '@/lib/stores/receipt'
import { Failure, Success } from '@/lib/types'

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
      throw new Error(response.Error.Message)
    }
  } catch {
    throw new Error('')
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
export const useCheckoutPayForOrderMutation = () => {
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const guestAddress = useCheckoutGuestAddress()
  const cvv = useCheckoutCvv()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: cart } = useCartQuery()
  const { data: consultant } = useConsultantQuery()
  const { data: totalData } = useGetSubtotalQuery()
  const { reset } = useCheckoutActions()
  const { setReceipt } = useReceiptActions()

  return useMutation<unknown, Failure, Partial<PayForOrderOptions> | Record<string, never>>({
    mutationFn: options =>
      payForOrder({ ...options, cartId: cart?.id || '', consultantUrl: consultant?.url, cvv }),
    mutationKey: [PAY_FOR_ORDER_MUTATION_KEY],
    onError: _error => {
      // console.log()
    },
    onSuccess: async () => {
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
        deliveryMethodDisplayName: totalData?.shipping.displayName || '',
        discounts: cart?.discounts || [],
        isSharedCart: cart?.isSharedCart || false,
        orderDisplayId: cart?.orderDisplayId,
        prices: {
          appliedSkyWallet: 0,
          retailDeliveryFee: totalData?.retailDeliveryFee || 0,
          salesTax: totalData?.tax || 0,
          shipping: totalData?.shipping.price || 0,
          subtotal: totalData?.subtotal || 0,
          subtotalAfterSavings: totalData?.subtotalAfterSavings || 0,
        },
      }

      reset()

      setReceipt(checkoutReceipt)
      queryClient.invalidateQueries(CART_QUERY_KEY)
      await signOutServerSide()
      router.push(CHECKOUT_CONFIRMATION_PAGE_PATH)
    },
  })
}
