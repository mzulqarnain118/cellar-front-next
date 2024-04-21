import { useCallback, useMemo } from 'react'

import { PlusIcon } from '@heroicons/react/24/outline'
import { Tabs, TabsPanelProps } from '@mantine/core'
import { modals } from '@mantine/modals'

import { Button } from '@/core/components/button'

import { useCustomerQuery } from '../../queries/customer'

import { AddAddressForm } from './add-address-form'
import { Address } from './address'

const plusIcon = <PlusIcon className="h-4 w-4" />

export const ShippingAddresses = (props: TabsPanelProps) => {
  const { data: customer } = useCustomerQuery()

  const addresses = useMemo(
    () =>
      customer?.Person_Addresses ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {customer?.Person_Addresses?.map(address => (
            <Address key={address.AddressID} address={address} />
          ))}
        </div>
      ) : undefined,
    [customer?.Person_Addresses]
  )

  const handleAddNewAddress = useCallback(
    () =>
      modals.open({
        centered: true,
        children: <AddAddressForm handleClose={modals.closeAll} />,
        size: 'xl',
        title: 'Add address',
      }),
    []
  )

  return (
    <Tabs.Panel {...props}>
      <div className="mb-4 flex items-center justify-end">
        <Button color="ghost" startIcon={plusIcon} variant="outline" onClick={handleAddNewAddress}>
          Add new address
        </Button>
      </div>
      {addresses}
    </Tabs.Panel>
  )
}
