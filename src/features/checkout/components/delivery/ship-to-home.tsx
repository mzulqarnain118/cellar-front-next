import { useCallback, useEffect, useMemo } from 'react'

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Collapse, LoadingOverlay, Select, SelectProps, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { formatCurrency } from '@/core/utils'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
} from '@/lib/stores/checkout'
import { isPickUpShippingMethodId } from '@/lib/utils/checkout'

import { AddressForm } from './address-form'

import { DeliveryRefs } from '.'

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }

interface ShipToHomeProps {
  refs: DeliveryRefs
}

export const ShipToHome = ({ refs }: ShipToHomeProps) => {
  const { data } = useAddressesAndCreditCardsQuery()
  const { mutate: applyCheckoutSelections, isLoading: isApplyingSelections } =
    useApplyCheckoutSelectionsMutation()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const { data: shippingMethodsData } = useShippingMethodsQuery()
  const { data: cartTotalData } = useGetSubtotalQuery()
  const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
    useUpdateShippingMethodMutation()
  const [addressFormOpen, { close: closeAddressForm, toggle: toggleAddressForm }] =
    useDisclosure(false)
  const { setIsAddingAddress } = useCheckoutActions()

  const handleAddressChange: SelectProps['onChange'] = useCallback(
    (addressId: string | null) => {
      if (!!addressId && data !== undefined && data.addresses.length > 0) {
        const correspondingAddress = data.addresses.find(
          address => address.AddressID.toString() === addressId.toLowerCase()
        )
        if (correspondingAddress !== undefined) {
          applyCheckoutSelections({
            addressId: correspondingAddress?.AddressID,
            paymentToken: activeCreditCard?.PaymentToken,
          })
        }
      }
    },
    [activeCreditCard?.PaymentToken, applyCheckoutSelections, data]
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

  const disabled = isUpdatingShippingMethod || isApplyingSelections

  useEffect(() => {
    setIsAddingAddress(addressFormOpen)
  }, [addressFormOpen, setIsAddingAddress])

  return (
    <div className="space-y-4">
      <LoadingOverlay visible={disabled} />
      <Collapse in={!addressFormOpen}>
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
          addressFormOpen ? <XMarkIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />
        }
        onClick={toggleAddressForm}
      >
        {addressFormOpen ? 'Cancel' : 'Add address'}
      </Button>

      <Collapse in={addressFormOpen}>
        <AddressForm ref={refs.shippingAddressRef} onCreateAddress={closeAddressForm} />
      </Collapse>

      <Collapse in={!addressFormOpen}>
        {shippingMethodsData === undefined ? (
          <>
            <Skeleton className="mb-1 h-6" width={120} />
            <Skeleton className="h-10" />
          </>
        ) : (
          <Select
            ref={refs.shippingMethodRef}
            classNames={dropdownClassNames}
            data={shippingMethods}
            disabled={disabled}
            label="Shipping method"
            value={cartTotalData?.shipping.methodId.toString()}
            onChange={handleShippingMethodChange}
          />
        )}
      </Collapse>
    </div>
  )
}
