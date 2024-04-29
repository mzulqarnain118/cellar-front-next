import { useCallback } from 'react'

import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ActionIcon } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'

import { Typography } from '@/core/components/typogrpahy'

import { useDeleteCreditCardMutation } from '../../mutations/delete-credit-card'
import { useUpdateCreditCardMutation } from '../../mutations/update-credit-card'
import { CustomerCreditCard } from '../../queries/customer'

interface CreditCardProps {
  data: CustomerCreditCard
}

export const CreditCard = ({ data }: CreditCardProps) => {
  const [_, scrollTo] = useWindowScroll()
  const { mutate: deleteCreditCard } = useDeleteCreditCardMutation()
  const { mutate: updateCreditCard } = useUpdateCreditCardMutation()

  const handleSetAsDefault = useCallback(() => {
    updateCreditCard({ ...data, DefaultPaymentMethod: true })
  }, [data, updateCreditCard])

  const handleDelete = useCallback(
    () =>
      modals.openContextModal({
        centered: true,
        innerProps: {
          body: (
            <Typography>
              Are you sure you want to delete this credit card? You cannot undo this action.
            </Typography>
          ),
          cancelText: 'Never mind',
          confirmProps: { color: 'error' },
          confirmText: 'Delete credit card',
          onCancel: () => modals.closeAll(),
          onConfirm: () => {
            deleteCreditCard(data.PaymentToken || '')
            scrollTo({ y: 0 })
          },
        },
        modal: 'confirmation',
        title: 'Delete credit card',
      }),
    [data.PaymentToken, deleteCreditCard, scrollTo]
  )
  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <Typography as="h5">
          {data.DefaultPaymentMethod ? 'Default Credit Card' : undefined}
        </Typography>
        <div className="flex items-center gap-2">
          {data.DefaultPaymentMethod ? undefined : (
            <>
              <ActionIcon
                className="text-neutral-700 hover:text-neutral-50"
                color="dark"
                title="Set credit card as default"
                variant="filled"
                onClick={handleSetAsDefault}
              >
                <HeartIcon className="h-4 w-4" />
              </ActionIcon>
              <ActionIcon
                className="text-error hover:text-neutral-50"
                color="error"
                title="Delete credit card"
                variant="subtle"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4" />
              </ActionIcon>
            </>
          )}
        </div>
      </div>
      <div className="grid auto-rows-auto grid-cols-2 border-y border-neutral-light p-4">
        <Typography className="font-bold">Name on card</Typography>
        <Typography>{data.NameOnCard}</Typography>
        <Typography className="font-bold">Card number</Typography>
        <Typography>{`**** **** **** ${data.DisplayNumber}`}</Typography>
        <Typography className="font-bold">Card type</Typography>
        <Typography>{data.CreditCardTypeName}</Typography>
        <Typography className="font-bold">Expiration date</Typography>
        <Typography>
          {data.ExpirationMonth}/{data.ExpirationYear}
        </Typography>
        <Typography className="font-bold">Street</Typography>
        <Typography>{data.Address.Street1}</Typography>
        <Typography className="font-bold">City</Typography>
        <Typography>{data.Address.City}</Typography>
        <Typography className="font-bold">State</Typography>
        <Typography>{data.Address.ProvinceName}</Typography>
        <Typography className="font-bold">Zip code</Typography>
        <Typography>{data.Address.PostalCode?.slice(0, 5)}</Typography>
      </div>
    </div>
  )
}
