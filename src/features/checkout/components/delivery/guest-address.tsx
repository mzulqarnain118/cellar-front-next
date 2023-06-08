import { useCallback, useMemo } from 'react'

import dynamic from 'next/dynamic'

import { Collapse, Select, SelectProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { Skeleton } from '@/core/components/skeleton'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import { useCheckoutActions, useCheckoutGuestAddress } from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'
import { isPickUpShippingMethodId } from '@/lib/utils/checkout'

import type { DeliveryRefs } from '.'

const AddressForm = dynamic(() => import('./address-form').then(({ AddressForm }) => AddressForm), {
  ssr: false,
})

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }

interface GuestAddressProps {
  shippingAddressRef: DeliveryRefs['shippingAddressRef']
}

export const GuestAddress = ({ shippingAddressRef }: GuestAddressProps) => {
  const guestAddress = useCheckoutGuestAddress()
  const { isLoading: isApplyingSelections } = useApplyCheckoutSelectionsMutation()
  const { data: cartTotalData } = useGetSubtotalQuery()
  const { data: shippingMethodsData } = useShippingMethodsQuery()
  const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
    useUpdateShippingMethodMutation()
  const { setGuestAddress } = useCheckoutActions()
  const [addressFormOpen, { close: closeAddressForm, toggle: toggleAddressForm }] = useDisclosure(
    guestAddress === undefined
  )

  const handleShippingMethodChange: SelectProps['onChange'] = useCallback(
    (shippingMethodId: string | null) => {
      if (
        !!shippingMethodId &&
        shippingMethodsData !== undefined &&
        shippingMethodsData.length > 0
      ) {
        updateShippingMethod({ shippingMethodId: parseInt(shippingMethodId) })
      }
    },
    [shippingMethodsData, updateShippingMethod]
  )

  const shippingMethods = useMemo(
    () =>
      shippingMethodsData !== undefined
        ? shippingMethodsData
            .map(method => ({
              data: method,
              label: `${method.displayName} (${formatCurrency(method.shippingPrice)})`,
              value: method.shippingMethodId.toString(),
            }))
            .filter(method => !isPickUpShippingMethodId(method.data.shippingMethodId))
        : [],
    [shippingMethodsData]
  )
  const handleCreateAddress = useCallback(
    (address?: Address) => {
      setGuestAddress(address || guestAddress)
      closeAddressForm()
    },
    [closeAddressForm, guestAddress, setGuestAddress]
  )

  const disabled = isUpdatingShippingMethod || isApplyingSelections

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
        {shippingMethodsData === undefined || shippingMethodsData.length === 0 ? (
          <>
            <Skeleton className="mb-1 h-6 w-[7.5rem]" />
            <Skeleton className="h-10" />
          </>
        ) : (
          <Select
            classNames={dropdownClassNames}
            data={shippingMethods}
            disabled={disabled}
            label="Shipping method"
            value={cartTotalData?.shipping.methodId.toString()}
            onChange={handleShippingMethodChange}
          />
        )}
      </Collapse>
    </>
  )
}
