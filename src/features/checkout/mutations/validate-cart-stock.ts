import { useRouter } from 'next/router'

import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { useCartOpen } from '@/lib/stores/process'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart, CartItem } from '@/lib/types'
import { trackCheckoutBegin } from '@/lib/utils/gtm-util'
import toast from '@/lib/utils/notifications'
import { useMemo } from 'react'

interface ValidateCartStockSuccess {
  Success: true
}

interface Failure {
  Success: false
  Response: any
  Error: string
}

type ValidateCartStockResponse = ValidateCartStockSuccess | Failure
type ValidateCartStockOptions = {
  CartId: string
}
type ValidateCartStockMutationOptions = {
  returnData?: boolean
}

const fallbackErrorMessage = "Couldn't route to the checkout page, please try again!"

export const validateCartStock = async ({ CartId }: ValidateCartStockOptions) => {
  try {
    const response = await api('ValidateCartStock', {
      json: {
        CartId,
      },
      method: 'post',
    }).json<ValidateCartStockResponse>()

    return response
  } catch (error) {
    throw new Error(fallbackErrorMessage)
  }
}

export const useValidateCartStockMutation = (
  returnData = false
): ValidateCartStockMutationOptions => {
  const { data: session } = useSession()
  const { mutateAsync } = useAddToCartMutation()
  const { toggleCartOpen } = useCartOpen()
  const { shippingState } = useShippingStateStore()
  const queryKey = useMemo(
    () => [...CART_QUERY_KEY, shippingState.provinceID || session?.user?.shippingState.provinceID],
    [session?.user?.shippingState.provinceID, shippingState]
  )
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: cart } = useCartQuery()
  const subtotal =
    cart?.items?.reduce((total, item) => {
      const price = item.onSalePrice || item.price
      return price * (item.quantity || 1) + total
    }, 0) || 0
  const { data, error, mutate, isLoading, isSuccess } = useMutation({
    mutationFn: () =>
      validateCartStock({
        CartId: queryClient.getQueryData<Cart | undefined>(queryKey)?.id || '',
      }),
    mutationKey: 'validateCartStock',
    onMutate: () => {
      toast('loading', 'Validating your cart...')
    },
    onSuccess: async data => {
      notifications.clean()
      if (data?.Success) {
        toast('success', 'Validated cart successfully!')

        if (session?.user) {
          router.push(CHECKOUT_PAGE_PATH)
        } else {
          router.push(`${SIGN_IN_PAGE_PATH}?redirectTo=${CHECKOUT_PAGE_PATH}`)
        }

        if (cart?.items !== undefined) {
          // Track either the user clicked on checkout button
          trackCheckoutBegin(cart?.items, subtotal)
        }

        toggleCartOpen()
      } else if (returnData) {
        return { data }
      } else if (data?.Response?.length > 0) {
        const unAvailableProducts = data.Response.map(
          (errorMsg: any) => `<li>${errorMsg.DisplayName}</li>`
        ).join('')

        const message = `One or more products in your cart are not available for purchase. Please remove them in order to proceed.`

        toast('error', message, `\n<ul>${unAvailableProducts}</ul>`)
      } else {
        if (data?.Error === 'Order is not found or does not exist, please try again') {
          const existingCartitem = cart?.items
          localStorage.removeItem('cart')
          await queryClient.invalidateQueries(queryKey)
          if (existingCartitem?.length) {
            await Promise.all(
              existingCartitem.map(async item =>
                mutateAsync({
                  quantity: item?.quantity,
                  item: {
                    sku: item?.sku,
                  } as Omit<CartItem, 'orderLineId' | 'orderId' | 'quantity'>,
                  cartId: queryClient.getQueryData<Cart | undefined>(queryKey)?.id,
                })
              )
            )
          }

          return mutate()
        }
        toast('error', data?.Response?.[0]?.Error?.Message || fallbackErrorMessage)
      }
    },
  })
  return {
    data,
    error,
    mutate,
    isLoading,
    isSuccess,
  }
}
