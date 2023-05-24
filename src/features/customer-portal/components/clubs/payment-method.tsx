import { ChangeEvent, useCallback } from 'react'

import { TrashIcon } from '@heroicons/react/24/outline'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { clsx } from 'clsx'
import { Divider } from 'react-daisyui'

import { Typography } from '@/core/components/typogrpahy'

import { useDeleteCreditCardMutation } from '../../mutations/delete-credit-card'
import { useUpdateCreditCardMutation } from '../../mutations/update-credit-card'
import { CustomerCreditCard } from '../../queries/customer'

interface PaymentMethodProps {
  checked?: boolean
  creditCard: CustomerCreditCard
  handleChecked: (event: ChangeEvent<HTMLInputElement>) => void
  refetchSubscription?: () => void
}

export const PaymentMethod = ({
  checked = false,
  creditCard,
  handleChecked,
  refetchSubscription,
}: PaymentMethodProps) => {
  const [_, scrollTo] = useWindowScroll()
  const { mutate: updateCreditCard } = useUpdateCreditCardMutation()
  const { mutate: deleteCreditCard } = useDeleteCreditCardMutation()

  const handleSetAsDefault = useCallback(() => {
    updateCreditCard({ ...creditCard, DefaultPaymentMethod: true })

    if (refetchSubscription !== undefined) {
      refetchSubscription()
    }
  }, [creditCard, refetchSubscription, updateCreditCard])

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
            deleteCreditCard(creditCard.PaymentToken || '')
            scrollTo({ y: 0 })

            if (refetchSubscription !== undefined) {
              refetchSubscription()
            }
          },
        },
        modal: 'confirmation',
        title: 'Delete credit card',
      }),
    [creditCard.PaymentToken, deleteCreditCard, refetchSubscription, scrollTo]
  )

  return (
    <>
      <div
        className={clsx(
          'rounded border-4 border-solid border-gray-300 p-3',
          checked && '!border-[#bdac9f]'
        )}
      >
        <div className="flex items-center justify-between">
          <h6 className="m-0 !text-base">
            {creditCard.CreditCardTypeName} ending in {creditCard.DisplayNumber}
          </h6>
          {creditCard.DefaultPaymentMethod && (
            <span className="text-sm font-bold">Default Payment Method</span>
          )}
          {creditCard.DefaultPaymentMethod || checked ? undefined : (
            <div className="flex items-center gap-1 text-sm">
              <button
                className="border-none bg-transparent hover:underline"
                onClick={handleSetAsDefault}
              >
                Set as default
              </button>
              <button
                className="group flex items-center gap-1 border-0 bg-transparent text-red-600"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="group-hover:underline">Delete</span>
              </button>
            </div>
          )}
        </div>
        <Divider className="my-1" />
        <div className="grid auto-rows-auto grid-cols-2 gap-4">
          <div className="flex flex-col">
            <strong>Name on Card</strong>
            <span className="text-sm">{creditCard.NameOnCard}</span>
          </div>
          <div className="flex flex-col">
            <strong>Expiry Date</strong>
            <span className="text-sm">
              {creditCard.ExpirationMonth}/{creditCard.ExpirationYear}
            </span>
          </div>

          <div className="grid">
            <strong>Billing Address</strong>
            <span className="text-sm">{creditCard.Address.Street1}</span>
            <span className="text-sm">
              {creditCard.Address.City}, {creditCard.Address.ProvinceAbbreviation}{' '}
              {creditCard.Address.PostalCode}
            </span>
          </div>
          <label
            className="m-0 flex cursor-pointer items-center gap-1"
            htmlFor={`${creditCard.PaymentToken}-${creditCard.ProfilePaymentToken}`}
          >
            <input
              checked={checked}
              className="h-4 w-4 cursor-pointer accent-[#bdac9f]"
              id={`${creditCard.PaymentToken}-${creditCard.ProfilePaymentToken}`}
              type="radio"
              value={creditCard.PaymentToken || undefined}
              onChange={handleChecked}
            />
            Use this credit card
          </label>
        </div>
      </div>
    </>
  )
}
