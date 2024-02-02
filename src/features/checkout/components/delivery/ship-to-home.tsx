import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { PlusIcon } from '@heroicons/react/24/outline'
import { Collapse, Select, SelectProps, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useRemoveFromCartMutation } from '@/lib/mutations/cart/remove-from-cart'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useCartQuery } from '@/lib/queries/cart'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import {
  useShippingMethodsQuery
} from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutRemovedCartItems,
} from '@/lib/stores/checkout'
import { isPickUpShippingMethodId } from '@/lib/utils/checkout'
import { toastLoading } from '@/lib/utils/notifications'

import type { DeliveryRefs } from '.'

const AddressForm = dynamic(() => import('./address-form').then(({ AddressForm }) => AddressForm), {
  ssr: false,
})

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }

const plusIcon = <PlusIcon className="h-4 w-4" />

interface ShipToHomeProps {
  refs: DeliveryRefs
  cartTotalData: any
}

export const ShipToHome = memo(({ refs, cartTotalData }: ShipToHomeProps) => {
  const [removedProductsModalBtnDisabled, setRemovedProductsModalBtnDisabled] = useState(false)
  const queryClient = useQueryClient()
  const { data } = useAddressesAndCreditCardsQuery()
  const { data: cart } = useCartQuery()
  const { mutate: applyCheckoutSelections, isLoading: isApplyingSelections } =
    useApplyCheckoutSelectionsMutation()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const removedCartItems = useCheckoutRemovedCartItems()
  const { data: shippingMethodsData } = useShippingMethodsQuery()
  const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
    useUpdateShippingMethodMutation()
  const [addressFormOpen, { close: closeAddressForm, toggle: toggleAddressForm }] =
    useDisclosure(false)
  const { setIsAddingAddress, setRemovedCartItems } = useCheckoutActions()
  const { mutate: removeFromCart } = useRemoveFromCartMutation()

  const handleAddressChange: SelectProps['onChange'] = useCallback(
    (addressId: string | null) => {
      if (!!addressId && !!data && data.addresses.length > 0) {
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
      !!data && data.addresses.length > 0
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

  // const initializeShippingMethod = useCallback(() => {
  //   const initialShippingMethodId = shippingMethods?.[0]?.data?.shippingMethodId;
  //   if (initialShippingMethodId !== undefined) {
  //     updateShippingMethod({ shippingMethodId: initialShippingMethodId });
  //   }
  // }, []);

  // useEffect(() => {
  //   initializeShippingMethod();
  // }, [shippingMethods?.[0]?.data?.shippingMethodId]);


  useEffect(() => {
    if (removedCartItems.length > 0) {
      modals.openContextModal({
        centered: true,
        classNames: {
          title: '!text-lg',
        },
        id: 'removed-items',
        innerProps: {
          body: (
            <div className="grid gap-2">
              <Typography as="p">
                The following products will be removed from your cart because they are not available
                in the state you are shipping to:
              </Typography>
              <ul className="flex flex-col gap-4">
                {removedCartItems.map(product => (
                  <li key={product.sku}>
                    <strong>{product.displayName}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ),
          cancelProps: { disabled: removedProductsModalBtnDisabled },
          cancelText: 'Continue',
          confirmProps: { disabled: removedProductsModalBtnDisabled },
          confirmText: 'Select a different address',
          onCancel: async () => {
            setRemovedProductsModalBtnDisabled(true)
            toastLoading({ message: 'Removing unavailable products from your cart...' })

            removedCartItems.forEach(item => {
              removeFromCart({ fetchSubtotal: false, item, sku: item.sku })
            })

            setRemovedCartItems([])
            notifications.clean()
            modals.closeAll()
            setRemovedProductsModalBtnDisabled(false)
          },
          onConfirm: () => {
            setRemovedProductsModalBtnDisabled(true)
            handleAddressChange(
              (data?.primaryAddress?.AddressID || data?.addresses[0].AddressID || 0).toString()
            )
            setRemovedCartItems([])
            modals.closeAll()
            setRemovedProductsModalBtnDisabled(false)
          },
        },
        modal: 'confirmation',
        title: 'Heads up!',
      })
    } else {
      modals.close('removed-items')
    }
  }, [
    cart?.id,
    data?.addresses,
    data?.primaryAddress?.AddressID,
    handleAddressChange,
    queryClient,
    removeFromCart,
    removedCartItems,
    removedProductsModalBtnDisabled,
    setRemovedCartItems,
  ])

  return (
    <div className="space-y-4">
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

      {addressFormOpen ? undefined : (
        <Button color="ghost" size="sm" startIcon={plusIcon} onClick={toggleAddressForm}>
          Add address
        </Button>
      )}

      <Collapse in={addressFormOpen}>
        <AddressForm ref={refs.shippingAddressRef} onCreateAddress={closeAddressForm} />
      </Collapse>

      <Collapse in={!addressFormOpen}>
        {shippingMethodsData === undefined || shippingMethodsData.length === 0 ? (
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
})
