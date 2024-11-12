import { useCallback } from 'react'

import dynamic from 'next/dynamic'

import { useCheckoutActions, useCheckoutGuestAddress } from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'

import type { DeliveryRefs } from '.'

const AddressForm = dynamic(() => import('./address-form').then(({ AddressForm }) => AddressForm), {
  ssr: false,
})

interface GuestAddressProps {
  shippingAddressRef: DeliveryRefs['shippingAddressRef']
  cartTotalData: any
}

export const GuestAddress = ({ shippingAddressRef, cartTotalData }: GuestAddressProps) => {
  const guestAddress = useCheckoutGuestAddress()
  const { setGuestAddress } = useCheckoutActions()

  const handleCreateAddress = useCallback(
    (address?: Address) => {
      setGuestAddress(address || guestAddress)
    },
    [guestAddress, setGuestAddress]
  )

  return (
    <>
      <AddressForm
        ref={shippingAddressRef}
        cartTotalData={cartTotalData}
        onCreateAddress={handleCreateAddress}
      />
    </>
  )
}
