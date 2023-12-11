import { api } from '@/lib/api'
import { CHECKOUT_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useCartOpen } from '@/lib/stores/process'
import { trackCheckoutBegin } from '@/lib/utils/gtm-util'
import toast from '@/lib/utils/notifications'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface ValidateCartStockSuccess {
  Success: true
}

interface Failure {
  Success: false
  Response: any
  Error: {
    Code: string
    Message: string
    Traceback?: Record<string, unknown>
  }
}

type ValidateCartStockResponse = ValidateCartStockSuccess | Failure
type ValidateCartStockOptions = {
  CartId: string
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


export const useValidateCartStockMutation = () => {
  const { data: session } = useSession()
  const { cartOpen, toggleCartOpen } = useCartOpen()
  const router = useRouter()
  const { data: cart } = useCartQuery()
  const subtotal =
    cart?.items?.reduce((total, item) => {
      const price = item.onSalePrice || item.price
      return price * (item.quantity || 1) + total
    }, 0) || 0
  return useMutation({
    mutationFn: () =>
      validateCartStock({
        CartId: cart?.id || '',
      }),
    onMutate: () => {
      toast("loading", "Validating your cart...")
    },
    onSuccess: data => {
      notifications.clean()
      if (data?.Success) {
        toast("success", 'Validated cart successfully!')
        const redirection = session?.user ? CHECKOUT_PAGE_PATH : SIGN_IN_PAGE_PATH
        router.push(
          session?.user ? redirection : `${redirection}?redirectTo=${CHECKOUT_PAGE_PATH}`,
          redirection
        )
        if (cart?.items !== undefined) {
          // Track either the user clicked on checkout button
          trackCheckoutBegin(cart?.items, subtotal)
        }
        toggleCartOpen()
      } else {
        if (data?.Response?.length > 0) {
          const unAvailableProducts = data.Response.map(
            (errorMsg: any) => `<li>${errorMsg.DisplayName}</li>`
          ).join('')
          const message = `One or more products in your cart are not available for purchase. Please remove them in order to proceed.`
          toast("error", message, `\n<ul>${unAvailableProducts}</ul>`)
        } else {
          toast("error", data?.Response?.[0]?.Error?.Message || fallbackErrorMessage)
        }
      }
    },
  })
}
