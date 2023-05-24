import { ChangeEvent, useCallback } from 'react'

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { clsx } from 'clsx'
import { Divider } from 'react-daisyui'

import { Typography } from '@/core/components/typogrpahy'

import { useDeleteAddressMutation } from '../../mutations/delete-address'
import { CustomerAddress } from '../../queries/customer'
import { EditAddressForm } from '../shipping-addresses/edit-address-form'

interface DeliveryAddressProps {
  address: CustomerAddress
  checked?: boolean
  handleChecked: (event: ChangeEvent<HTMLInputElement>) => void
}

export const DeliveryAddress = ({ address, checked, handleChecked }: DeliveryAddressProps) => {
  const [_, scrollTo] = useWindowScroll()
  const { mutate: deleteAddress } = useDeleteAddressMutation()

  const handleDelete = useCallback(
    () =>
      modals.openContextModal({
        centered: true,
        innerProps: {
          body: (
            <Typography>
              Are you sure you want to delete this addess? You cannot undo this action.
            </Typography>
          ),
          cancelText: 'Never mind',
          confirmProps: { color: 'error' },
          confirmText: 'Delete address',
          onCancel: () => modals.closeAll(),
          onConfirm: () => {
            deleteAddress({ addressId: address.AddressID })
            scrollTo({ y: 0 })
          },
        },
        modal: 'confirmation',
        title: 'Delete address',
      }),
    [address.AddressID, deleteAddress, scrollTo]
  )

  const handleEdit = useCallback(
    () =>
      modals.open({
        centered: true,
        children: <EditAddressForm address={address} handleClose={modals.closeAll} />,
        size: 'lg',
        title: 'Edit address',
      }),
    [address]
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
          <h6 className="m-0 !text-base">{address.DisplayName || address.NickName}</h6>
          <span
            className={clsx(
              `invisible h-6 font-bold`,
              address.Primary && 'visible',
              !address.Primary && (address.DisplayName || address.NickName) && 'hidden'
            )}
          >
            Default Address
          </span>
          {!address.Primary && checked ? undefined : (
            <div className="flex items-center gap-4">
              <button
                className="group flex items-center gap-1 border-0 bg-transparent"
                onClick={handleEdit}
              >
                <PencilIcon className="h-4 w-4" />
                <span className="group-hover:underline">Edit</span>
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
          <div className="grid">
            <strong>
              {address.FirstName} {address.LastName}
            </strong>
            <span className="text-sm">{address.Street1}</span>
            <span className="text-sm">
              {address.City}, {address.ProvinceAbbreviation} {address.PostalCode}
            </span>
          </div>
          <label
            className="m-0 flex cursor-pointer items-center gap-1"
            htmlFor={`${address.AddressID}-${address.PostalCode}`}
          >
            <input
              checked={checked}
              className="h-4 w-4 cursor-pointer accent-[#bdac9f]"
              id={`${address.AddressID}-${address.PostalCode}`}
              type="radio"
              value={address.AddressID || undefined}
              onChange={handleChecked}
            />
            Use this address
          </label>
        </div>
      </div>
    </>
  )
}
