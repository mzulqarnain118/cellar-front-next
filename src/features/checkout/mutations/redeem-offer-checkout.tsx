import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { GET_SUBTOTAL_QUERY } from '@/lib/queries/checkout/get-subtotal'
import { CART_INFO_QUERY_KEY, getCartInfo } from '@/lib/queries/get-info'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart } from '@/lib/types'
import toast, { toastSuccess } from '@/lib/utils/notifications'
import { notifications } from '@mantine/notifications'
import { SKY_WALLET_QUERY_KEY } from '../queries/sky-wallet'

interface Notifications {
  Notifications: { Message: string }[]
}

interface Response extends Notifications {
  hasError: boolean
  response: { data: { Message: string } & Notifications }
}

interface RedeemOfferOptions {
  CartId?: string
  CouponCode: string
}

export const redeemOfferCheckout = async ({ CouponCode, CartId }: RedeemOfferOptions) => {
  try {
    const response = await api('v2/checkout/AddCouponToCart', {
      method: 'post',
      json: { CartId, CouponCode },
    }).json<Response>()

    // if (!response.hasError) {
    //   return response
    // }

    return response
  } catch (err) {

    throw new Error(err?.message)
  }
}

export const useRedeemOfferCheckoutMutation = () => {
  const { data: session } = useSession()
  const { data: cart } = useCartQuery()
  const { shippingState } = useShippingStateStore()

  const queryClient = useQueryClient()

  const {
    data,
    error,
    isError,
    isSuccess,
    mutate,
    mutateAsync,
  } = useMutation<string | undefined, Error, RedeemOfferOptions>({
    mutationFn: data => {
      return redeemOfferCheckout({ ...data })
    },
    mutationKey: ['redeem-offer'],
    onError: error => {
      toast("error", error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        SKY_WALLET_QUERY_KEY,
        cart?.id || ''
      ])
    },
    onSuccess: async (data) => {
      notifications.clean()
      if (data?.Success) {
        await queryClient.invalidateQueries([GET_SUBTOTAL_QUERY, cart?.id])
        const cartInfoData = await queryClient.fetchQuery({
          queryKey: [CART_INFO_QUERY_KEY, cart?.id],
          queryFn: getCartInfo
        })

        await toastSuccess({ message: 'Coupon redeemed!' })
        await queryClient.setQueryData<Cart>(
          [...CART_QUERY_KEY, shippingState.provinceID || session?.user?.shippingState.provinceID],
          {
            ...cart,
            items: cartInfoData?.OrderLines.map(
              ({
                ProductImage,
                DisplayPrice,
                Price,
                ProductSKU,
                ProductDisplayName,
                Quantity,
                OrderID,
                OrderLineID,
              }) => {
                const correspondingProduct = cart?.items.find(
                  item => item.sku.toLowerCase() === ProductSKU.toLowerCase()
                )
                const newProductData = {
                  imageUrl: ProductImage,
                  pictureUrl: ProductImage,
                  price: Price,
                  onSalePrice: DisplayPrice,
                  sku: ProductSKU,
                  name: ProductDisplayName,
                  displayName: ProductDisplayName,
                  orderLineId: OrderLineID,
                  orderId: OrderID,
                  quantity: Quantity,
                }
                return correspondingProduct !== undefined
                  ? { ...correspondingProduct, ...newProductData }
                  : newProductData
              }
            )
          }
        )
      } else {
        toast("error", data?.Error.Message)
      }
    },
  })

  return {
    data,
    error,
    isError,
    isSuccess,
    mutate,
    mutateAsync,
  };
}
