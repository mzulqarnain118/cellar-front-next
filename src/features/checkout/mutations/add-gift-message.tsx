import { CheckIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutActions } from '@/lib/stores/checkout'
import { toastSuccess } from '@/lib/utils/notifications'

interface AddGiftMessageSuccess {
  Success: true
}

interface Failure {
  Success: false
  Error: {
    Code: string
    Message: string
    Traceback?: Record<string, unknown>
  }
}

type AddGiftMessageResponse = AddGiftMessageSuccess | Failure

const fallbackErrorMessage =
  'There was an error adding your gift message. Please review and try again.'

interface AddGiftMessageOptions {
  callback?: () => void
  message: string
  orderDisplayId?: string
  recipientEmail: string
}

export const addGiftMessage = async ({
  message,
  orderDisplayId,
  recipientEmail,
}: AddGiftMessageOptions) => {
  try {
    if (orderDisplayId === undefined) {
      return
    }

    const response = await api('v2/checkout/AddGiftMessage', {
      json: {
        EmailAddress: recipientEmail,
        Message: message.trim(),
        OrderDisplayID: parseInt(orderDisplayId),
      },
      method: 'post',
    }).json<AddGiftMessageResponse>()

    if (!response.Success) {
      throw new Error(response.Error.Message || fallbackErrorMessage)
    }

    return undefined
  } catch (error) {
    throw new Error(fallbackErrorMessage)
  }
}

export const useAddGiftMessageMutation = () => {
  const { data: cart } = useCartQuery()
  const { setGiftMessage } = useCheckoutActions()

  return useMutation<AddGiftMessageSuccess | undefined, Error, AddGiftMessageOptions>({
    mutationFn: options => addGiftMessage({ ...options, orderDisplayId: cart?.orderDisplayId }),
    mutationKey: ['addGiftMessage'],
    onSettled: (_apiResponse, _error, variables) => {
      const { message, recipientEmail } = variables
      setGiftMessage({
        message,
        recipientEmail,
      })

      toastSuccess({
        icon: <CheckIcon className="h-4 w-4" />,
        message: 'Your gift message was successfully added.',
      })
    },
  })
}
