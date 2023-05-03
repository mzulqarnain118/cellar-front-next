import { useCallback, useMemo } from 'react'

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Collapse, Select, SelectProps, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { formatCurrency } from '@/core/utils'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutActiveShippingAddress,
  useCheckoutShippingMethod,
} from '@/lib/stores/checkout'
import { isPickUpShippingMethodId } from '@/lib/utils/checkout'

import { AddressForm } from './address-form'

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }

export const ShipToHome = () => {
  const { data } = useAddressesAndCreditCardsQuery()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const { activeShippingAddress } = useCheckoutActiveShippingAddress()
  const { data: shippingMethodsData } = useShippingMethodsQuery()
  const { setShippingMethod } = useCheckoutActions()
  const [addressFormOpen, { close: closeAddressForm, toggle: toggleAddressForm }] =
    useDisclosure(false)
  const { shippingMethod } = useCheckoutShippingMethod()

  const handleAddressChange: SelectProps['onChange'] = useCallback(
    (addressId: string) => {
      if (data !== undefined && data.addresses.length > 0) {
        const correspondingAddress = data.addresses.find(
          address => address.AddressID.toString() === addressId.toLowerCase()
        )
        if (correspondingAddress !== undefined) {
          applyCheckoutSelections({ addressId: correspondingAddress?.AddressID })
        }
      }
    },
    [applyCheckoutSelections, data]
  )

  const handleShippingMethodChange: SelectProps['onChange'] = useCallback(
    (shippingMethodId: string) => {
      if (shippingMethodsData !== undefined) {
        const correspondingShippingMethod = shippingMethodsData.find(
          method => method.shippingMethodId.toString() === shippingMethodId
        )

        if (correspondingShippingMethod !== undefined) {
          setShippingMethod({
            displayName: correspondingShippingMethod.displayName,
            id: correspondingShippingMethod.shippingMethodId,
            price: correspondingShippingMethod.shippingPrice,
          })
        }
      }
    },
    [setShippingMethod, shippingMethodsData]
  )

  const shippingAddresses = useMemo(
    () =>
      data !== undefined && data.addresses.length > 0
        ? data.addresses.map(data => {
            const label =
              !!data.FirstName && !!data.LastName ? `${data.FirstName} ${data.LastName}, ` : ''

            return {
              data,
              label: `${label}${data.Street1}, ${data.City}, ${data.ProvinceAbbreviation} ${data.PostalCode}`,
              value: data.AddressID.toString(),
            }
          })
        : [],
    [data]
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

  return (
    <div className="space-y-4">
      <Collapse in={true}>
        {data === undefined ? (
          <>
            <Skeleton className="mb-1 h-6" width={120} />
            <Skeleton className="h-10" />
          </>
        ) : (
          <Select
            classNames={dropdownClassNames}
            data={shippingAddresses}
            label="Shipping address"
            value={activeShippingAddress?.AddressID.toString()}
            onChange={handleAddressChange}
          />
        )}
      </Collapse>

      <Button
        color="ghost"
        size="sm"
        startIcon={
          addressFormOpen ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />
        }
        onClick={toggleAddressForm}
      >
        {addressFormOpen ? 'Remove address' : 'Add address'}
      </Button>

      <Collapse in={addressFormOpen}>
        <AddressForm onCreateAddress={closeAddressForm} />
      </Collapse>

      {
        <Collapse in={!!activeShippingAddress?.AddressID && !addressFormOpen}>
          {shippingMethodsData === undefined ? (
            <>
              <Skeleton className="mb-1 h-6" width={120} />
              <Skeleton className="h-10" />
            </>
          ) : (
            <Select
              classNames={dropdownClassNames}
              data={shippingMethods}
              label="Shipping method"
              value={shippingMethod?.id?.toString()}
              onChange={handleShippingMethodChange}
            />
          )}
        </Collapse>
      }
    </div>
  )
}
