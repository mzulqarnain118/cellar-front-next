import { useCallback } from 'react'

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ActionIcon } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'

import { Typography } from '@/core/components/typogrpahy'

import { useDeleteAddressMutation } from '../../mutations/delete-address'
import { CustomerAddress } from '../../queries/customer'

import { EditAddressForm } from './edit-address-form'

interface AddressProps {
  address: CustomerAddress
}

export const Address = ({ address }: AddressProps) => {
  const { mutate: deleteAddress } = useDeleteAddressMutation()
  const [_, scrollTo] = useWindowScroll()

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
    <div>
      <div className="flex items-center justify-between py-2">
        <Typography as="h5">
          {address.NickName} {address.Primary ? `Address (Default Address)` : undefined}
        </Typography>
        <div className="flex items-center gap-2">
          <ActionIcon
            className="text-neutral-700 hover:text-neutral-50"
            color="dark"
            title="Edit address"
            variant="filled"
            onClick={handleEdit}
          >
            <PencilIcon className="h-4 w-4" />
          </ActionIcon>
          {address.Primary ? undefined : (
            <ActionIcon
              className="text-error hover:text-neutral-50"
              color="error"
              title="Delete address"
              variant="subtle"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          )}
        </div>
      </div>
      <div className="grid gap-4 auto-rows-auto grid-cols-2 border-y border-neutral-light p-4">
        <Typography className="font-bold">Street</Typography>
        <Typography className="text-right">{address.Street1}</Typography>
        <Typography className="font-bold">City</Typography>
        <Typography className="text-right">{address.City}</Typography>
        <Typography className="font-bold">State</Typography>
        <Typography className="text-right">{address.ProvinceName}</Typography>
        <Typography className="font-bold">Postal Code</Typography>
        <Typography className="text-right">{address.PostalCode?.slice(0, 5)}</Typography>
        <Typography className="font-bold">Country</Typography>
        <Typography className="text-right">{address.CountryName}</Typography>
        <Typography className="font-bold">Phone number</Typography>
        <Typography className="text-right">{address.PhoneNumber}</Typography>
        {/* <Typography className="font-bold">Name</Typography>
        <Typography>
          {address.FirstName} {address.LastName}
        </Typography>

        {address.Street2 ? (
          <>
            <Typography className="font-bold">Street 2</Typography>
            <Typography>{address.Street2}</Typography>
          </>
        ) : undefined} */}

        {/* {!!address.PhoneNumber && address.PhoneNumber.length > 0 ? (
          <>
            <Typography className="font-bold">Phone number</Typography>
            <Typography>{address.PhoneNumber}</Typography>
          </>
        ) : undefined} */}
      </div>
    </div>
  )
}
