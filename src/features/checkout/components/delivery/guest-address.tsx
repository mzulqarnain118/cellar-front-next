import { useCallback } from 'react'

import dynamic from 'next/dynamic'

import { Collapse } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useCheckoutActions, useCheckoutGuestAddress } from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'

import type { DeliveryRefs } from '.'

const AddressForm = dynamic(() => import('./address-form').then(({ AddressForm }) => AddressForm), {
  ssr: false,
})

interface GuestAddressProps {
  shippingAddressRef: DeliveryRefs['shippingAddressRef']
}

export const GuestAddress = ({ shippingAddressRef }: GuestAddressProps) => {
  const { data: session } = useSession()
  const guestAddress = useCheckoutGuestAddress()
  const { setGuestAddress } = useCheckoutActions()
  const [addressFormOpen, { close: closeAddressForm, toggle: toggleAddressForm }] = useDisclosure(
    guestAddress === undefined
  )

  console.log(session)

  const handleCreateAddress = useCallback(
    (address?: Address) => {
      setGuestAddress(address)
      closeAddressForm()
    },
    [closeAddressForm, setGuestAddress]
  )

  return (
    <>
      <Collapse in={addressFormOpen}>
        <AddressForm ref={shippingAddressRef} onCreateAddress={handleCreateAddress} />
      </Collapse>

      <Collapse in={!addressFormOpen && guestAddress !== undefined}>
        <div className="mt-2 mb-4 border border-neutral-light p-4 w-max rounded bg-[#fafafa]">
          <div>
            <Typography className="block mb-3 text-18 font-bold">Your delivery address:</Typography>
            <Typography className="block">
              {guestAddress?.FirstName} {guestAddress?.LastName}
            </Typography>
            <Typography className="block">{guestAddress?.Street1}</Typography>
            <Typography className="block">{guestAddress?.Street2}</Typography>
            <Typography className="block">
              {guestAddress?.City}, {guestAddress?.ProvinceAbbreviation} {guestAddress?.PostalCode}
            </Typography>
          </div>
          <Button link onClick={toggleAddressForm}>
            Edit Address
          </Button>
        </div>
      </Collapse>
    </>
  )
}
