import { forwardRef, MutableRefObject, useCallback, useEffect, useMemo } from 'react'

import { Form } from '@/components/form'
import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useCreateAddressMutation } from '@/lib/mutations/address/create'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutErrors,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'
import { isPickUpShippingMethodId } from '@/lib/utils/checkout'
import { Collapse, LoadingOverlay, Select, SelectProps } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useSession } from 'next-auth/react'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { useDisclosure } from '@mantine/hooks'
import { dropdownClassNames } from './ship-to-home'

export const newAddressFormSchema = z.object({
  addressOne: z.string().min(1, { message: 'Please enter the address.' }),
  addressTwo: z.string().optional(),
  city: z.string().min(1, { message: 'Please enter the city.' }),
  company: z.string().optional(),
  firstName: z.string().min(1, { message: 'Please enter the first name.' }),
  lastName: z.string().min(1, { message: 'Please enter the last name.' }),
  setAsdefault: z.boolean().optional(),
  state: z.string().min(1, { message: 'Please select the state.' }),
  zipCode: z
    .string()
    .min(1, { message: 'Please enter the zip code.' })
    .max(5, { message: 'The zip code must be 5 numbers.' }),
})
export type NewAddressFormSchema = z.infer<typeof newAddressFormSchema>

interface AddressFormProps {
  onCreateAddress?: (address?: Address) => void
  size?: 'sm' | 'md'
  cartTotalData: any
  addressFormOpen?: boolean
  actionBtns?: boolean
  toggleActionBtns?: () => void
  closeActionBtns?: () => void
  paymentRef?: MutableRefObject<HTMLInputElement | null>
}

export const AddressForm = forwardRef<HTMLInputElement, AddressFormProps>(
  (
    {
      onCreateAddress,
      size = 'sm',
      cartTotalData,
      addressFormOpen = false,
      closeActionBtns,
      toggleActionBtns,
      actionBtns,
      paymentRef,
    },
    ref
  ) => {
    const errors = useCheckoutErrors()
    const guestAddress = useCheckoutGuestAddress()
    const { isLoading: isApplyingSelections } = useApplyCheckoutSelectionsMutation()
    const { data: shippingMethodsData } = useShippingMethodsQuery()
    const { shippingState } = useShippingStateStore()
    const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
      useUpdateShippingMethodMutation()
    const [guestAddressForm, { toggle: toggleGuestAddressForm }] = useDisclosure(
      guestAddress === undefined
    )

    const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
    const { mutate: createAddress, isLoading: isCreatingAddress } = useCreateAddressMutation()
    const { setOnContinuePayment } = useCheckoutActions()
    const { data: session } = useSession()

    const handleAddressChange = useCallback(() => {
      if (onCreateAddress !== undefined) {
        onCreateAddress(undefined)
      }
      closeActionBtns && closeActionBtns()
    }, [onCreateAddress])

    const shippingMethods = useMemo(
      () =>
        shippingMethodsData !== undefined
          ? shippingMethodsData
              .map(method => ({
                data: method,
                label: `${method.displayName} (${formatCurrency(method.shippingPrice)})`,
                value: method.shippingMethodId.toString(),
              }))
              .filter(method =>
                method?.data?.shippingMethodId === 1 && shippingState.name !== 'Oklahoma'
                  ? false
                  : !isPickUpShippingMethodId(method.data.shippingMethodId)
              )
          : [],
      [shippingMethodsData]
    )

    const disabled = isUpdatingShippingMethod || isApplyingSelections
    const defaultValues: NewAddressFormSchema = useMemo(
      () => ({
        addressOne: guestAddress?.Street1 || '',
        addressTwo: guestAddress?.Street2 || '',
        city: guestAddress?.City || '',
        company: guestAddress?.Company || '',
        firstName: guestAddress?.FirstName || '',
        lastName: guestAddress?.LastName || '',
        setAsdefault: guestAddress?.Primary || false,
        state: guestAddress?.ProvinceID.toString() || '',
        zipCode: guestAddress?.PostalCode.substring(0, 5) || '',
      }),
      [
        guestAddress?.City,
        guestAddress?.Company,
        guestAddress?.FirstName,
        guestAddress?.LastName,
        guestAddress?.PostalCode,
        guestAddress?.ProvinceID,
        guestAddress?.Street1,
        guestAddress?.Street2,
        guestAddress?.Primary,
      ]
    )

    const onSubmit: SubmitHandler<NewAddressFormSchema> = useCallback(
      (
        {
          addressOne: addressLineOne,
          setAsdefault,
          addressTwo: addressLineTwo = '',
          city,
          company = '',
          firstName,
          lastName,
          state: provinceId,
          zipCode,
        },
        reset
      ) => {
        validateAddress({
          addressLineOne,
          addressLineTwo,
          callback: response => {
            if (response.Success) {
              const suggested = response.Data.ValidatedAddresses?.[0]
              const entered = response.Data.OriginalAddress
              modals.openContextModal({
                centered: true,
                classNames: {
                  title: '!text-lg',
                },
                innerProps: {
                  body: (
                    <div className="grid gap-2">
                      <div className="grid">
                        <Typography as="strong">Suggested address</Typography>
                        <Typography>{suggested.Street1}</Typography>
                        {suggested.Street2 ? (
                          <Typography>{suggested.Street2}</Typography>
                        ) : undefined}
                        <Typography>
                          {suggested.City}, {suggested.ProvinceAbbreviation} {suggested.PostalCode}
                        </Typography>
                      </div>
                      <div className="grid">
                        <Typography as="strong">Entered address</Typography>
                        <Typography>{entered.Street1}</Typography>
                        {entered.Street2 ? <Typography>{entered.Street2}</Typography> : undefined}
                        <Typography>
                          {entered.City}, {entered.ProvinceAbbreviation} {entered.PostalCode}
                        </Typography>
                      </div>
                    </div>
                  ),
                  cancelText: 'Use entered address',
                  confirmText: 'Use suggested address',
                  onCancel: () => {
                    createAddress({
                      address: {
                        ...entered,
                        FirstName: firstName,
                        LastName: lastName,
                        Primary: setAsdefault,
                      },
                      callback: response => {
                        if (response.Success && onCreateAddress !== undefined) {
                          reset()
                          onCreateAddress(response.Data.Value)
                          session?.user?.isGuest && toggleGuestAddressForm()
                        }
                      },
                    })
                  },
                  onConfirm: () => {
                    createAddress({
                      address: {
                        ...suggested,
                        FirstName: firstName,
                        LastName: lastName,
                        Primary: setAsdefault,
                      },
                      callback: response => {
                        if (response.Success && onCreateAddress !== undefined) {
                          reset()
                          onCreateAddress(response.Data.Value)
                          session?.user?.isGuest && toggleGuestAddressForm()
                        }
                      },
                    })
                  },
                },
                modal: 'confirmation',
                title: 'Confirm address',
              })
            }
          },
          city,
          company,
          firstName,
          lastName,
          provinceId: parseInt(provinceId),
          zipCode,
          setAsdefault,
        })
      },
      [createAddress, onCreateAddress, validateAddress]
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
    useEffect(() => {
      if (addressFormOpen) {
        toggleActionBtns && toggleActionBtns()
      }
    }, [addressFormOpen])
    return (
      <div className="space-y-4">
        <LoadingOverlay visible={isCreatingAddress || isValidatingAddress} />
        <Collapse in={session?.user?.isGuest ? guestAddressForm : addressFormOpen}>
          <Form
            className="auto-grid-rows grid grid-cols-2 items-start gap-x-8"
            defaultValues={defaultValues}
            id="address-form"
            schema={newAddressFormSchema}
            onSubmit={onSubmit}
          >
            <Input
              className="col-span-2 [&>div:first-child]:!pt-1"
              instructionLabel="optional"
              label="Company"
              name="company"
              size={size}
            />
            <Input
              ref={ref}
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              label="First name"
              name="firstName"
              size={size}
            />
            <Input
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              label="Last name"
              name="lastName"
              size={size}
            />
            <Input
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              label="Address 1"
              name="addressOne"
              size={size}
            />
            <Input
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              instructionLabel="optional"
              label="Address 2"
              name="addressTwo"
              size={size}
            />
            <Input
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              label="City"
              name="city"
              size={size}
            />
            <StateDropdown className="col-span-2 sm:col-span-1 pt-1" name="state" size={size} />
            <Input
              className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
              label="Zip code"
              name="zipCode"
              size={size}
            />
            {!session?.user?.isGuest && (
              <Checkbox
                className="col-span-2 my-4"
                color="dark"
                label="Set as default"
                name="setAsdefault"
              />
            )}
          </Form>
        </Collapse>
        <div className="flex justify-end lg:justify-start !mb-2">
          {(session?.user?.isGuest ? guestAddressForm : addressFormOpen) && (
            <Button dark form="address-form" type="submit">
              Save and continue to Shipping Method
            </Button>
          )}
        </div>
        <Collapse in={!guestAddressForm && guestAddress !== undefined}>
          <div className="mt-2  border border-neutral-light p-4 w-max rounded bg-[#fafafa] pb-0">
            <div>
              <Typography className="block mb-3 text-18 font-bold">
                Your delivery address:
              </Typography>
              <Typography className="block">
                {guestAddress?.FirstName} {guestAddress?.LastName} {guestAddress?.Street1}{' '}
                {guestAddress?.Street2} {guestAddress?.City}, {guestAddress?.ProvinceAbbreviation}{' '}
                {guestAddress?.PostalCode}
              </Typography>
            </div>
            <Button
              link
              onClick={() => {
                toggleGuestAddressForm && toggleGuestAddressForm()
                session?.user?.isGuest && setOnContinuePayment(false)
              }}
            >
              Edit Address
            </Button>
          </div>
        </Collapse>

        <Collapse in={session?.user?.isGuest ? true : (actionBtns as boolean)} className="!mt-0">
          <Select
            ref={ref?.shippingMethodRef}
            classNames={dropdownClassNames}
            data={shippingMethods}
            disabled={disabled}
            label="Shipping method"
            value={cartTotalData?.shipping.methodId.toString()}
            onChange={handleShippingMethodChange}
          />
        </Collapse>
        <Collapse in={session?.user?.isGuest ? true : (actionBtns as boolean)}>
          <div className="flex justify-end lg:justify-start gap-2 mt-4">
            <Button
              dark
              onClick={() => {
                session?.user?.isGuest ? setOnContinuePayment(true) : toggleActionBtns?.()
                paymentRef?.current?.scrollIntoView()
                paymentRef?.current?.focus()
              }}
              disabled={session?.user?.isGuest ? shippingMethods?.length === 0 : false}
            >
              Continue to payment
            </Button>

            {!session?.user?.isGuest && (
              <Button color="ghost" type="button" onClick={handleAddressChange}>
                Cancel
              </Button>
            )}
          </div>
          {errors?.delivery ? (
            <Typography className="mt-4 block text-error">{errors.delivery}</Typography>
          ) : undefined}
        </Collapse>
      </div>
    )
  }
)

AddressForm.displayName = 'AddressForm'
