import { CheckIcon } from '@heroicons/react/24/outline'
import { notifications } from '@mantine/notifications'
import { UseMutationOptions, useMutation } from '@tanstack/react-query'

import { useCartQuery } from '@/lib/queries/cart'
import { useCheckoutStore } from '@/lib/stores/checkout'

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
  message: string
  orderDisplayId?: string
  recipientEmail: string
}

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export const addGiftMessage = async ({
  message: _m,
  orderDisplayId,
  recipientEmail: _e,
}: AddGiftMessageOptions) => {
  try {
    if (orderDisplayId === undefined) {
      return
    }

    // const response = await api('v2/checkout/AddGiftMessage', {
    //   json: {
    //     EmailAddress: recepientEmail,
    //     Message: message.trim(),
    //     OrderDisplayID: parseInt(orderDisplayId),
    //   },
    //   method: 'post',
    // }).json<AddGiftMessageResponse>()

    // if (!response.Success) {
    //   throw new Error(response.Error.Message || fallbackErrorMessage)
    // }

    await sleep(500)

    return undefined
  } catch (error) {
    throw new Error(fallbackErrorMessage)
  }
}

export const useAddGiftMessageMutation = (
  options?: UseMutationOptions<AddGiftMessageSuccess | undefined, Error, AddGiftMessageOptions>
) => {
  const { data: cart } = useCartQuery()
  const { setAccountDetails } = useCheckoutStore()

  return useMutation<AddGiftMessageSuccess | undefined, Error, AddGiftMessageOptions>(
    ['addGiftMessage'],
    options => addGiftMessage({ ...options, orderDisplayId: cart?.orderDisplayId }),
    {
      ...options,
      onSettled: (apiResponse, error, variables, context) => {
        const { message, recipientEmail } = variables
        setAccountDetails({
          giftMessage: { message, recipientEmail },
        })

        notifications.show({
          color: 'success',
          icon: <CheckIcon className="h-4 w-4" />,
          message: 'Your gift message was successfully added.',
        })

        if (options?.onSettled !== undefined) {
          options.onSettled(apiResponse, error, variables, context)
        }
      },
    }
  )
}
