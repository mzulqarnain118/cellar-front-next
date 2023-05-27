import { forwardRef, useCallback, useMemo } from 'react'

import { LoadingOverlay } from '@mantine/core'
import { modals } from '@mantine/modals'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/form'
import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useCreateAddressMutation } from '@/lib/mutations/address/create'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'
import { useCheckoutErrors, useCheckoutGuestAddress } from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'

export const newAddressFormSchema = z.object({
  addressOne: z.string().min(1, { message: 'Please enter the address.' }),
  addressTwo: z.string().optional(),
  city: z.string().min(1, { message: 'Please enter the city.' }),
  company: z.string().optional(),
  firstName: z.string().min(1, { message: 'Please enter the first name.' }),
  lastName: z.string().min(1, { message: 'Please enter the last name.' }),
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
}

export const AddressForm = forwardRef<HTMLInputElement, AddressFormProps>(
  ({ onCreateAddress, size = 'sm' }, ref) => {
    const errors = useCheckoutErrors()
    const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
    const { mutate: createAddress, isLoading: isCreatingAddress } = useCreateAddressMutation()
    const guestAddress = useCheckoutGuestAddress()

    const handleAddressChange = useCallback(() => {
      if (onCreateAddress !== undefined) {
        onCreateAddress(undefined)
      }
    }, [onCreateAddress])

    const defaultValues: NewAddressFormSchema = useMemo(
      () => ({
        addressOne: guestAddress?.Street1 || '',
        addressTwo: guestAddress?.Street2 || '',
        city: guestAddress?.City || '',
        company: guestAddress?.Company || '',
        firstName: guestAddress?.FirstName || '',
        lastName: guestAddress?.LastName || '',
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
      ]
    )

    const onSubmit: SubmitHandler<NewAddressFormSchema> = useCallback(
      ({
        addressOne: addressLineOne,
        addressTwo: addressLineTwo = '',
        city,
        company = '',
        firstName,
        lastName,
        state: provinceId,
        zipCode,
      }) => {
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
                      address: { ...entered, FirstName: firstName, LastName: lastName },
                      callback: response => {
                        if (response.Success && onCreateAddress !== undefined) {
                          onCreateAddress(response.Data.Value)
                        }
                      },
                    })
                  },
                  onConfirm: () => {
                    createAddress({
                      address: { ...suggested, FirstName: firstName, LastName: lastName },
                      callback: response => {
                        if (response.Success && onCreateAddress !== undefined) {
                          onCreateAddress(response.Data.Value)
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
        })
      },
      [createAddress, onCreateAddress, validateAddress]
    )

    return (
      <div className="space-y-4">
        <LoadingOverlay visible={isCreatingAddress || isValidatingAddress} />
        <Form
          className="auto-grid-rows grid grid-cols-12 items-start gap-x-8"
          defaultValues={defaultValues}
          id="address-form"
          schema={newAddressFormSchema}
          onSubmit={onSubmit}
        >
          <Input
            className="col-span-12 [&>div:first-child]:!pt-1"
            instructionLabel="optional"
            label="Company"
            name="company"
            size={size}
          />
          <Input
            ref={ref}
            className="col-span-6 [&>div:first-child]:!pt-1"
            label="First name"
            name="firstName"
            size={size}
          />
          <Input
            className="col-span-6 [&>div:first-child]:!pt-1"
            label="Last name"
            name="lastName"
            size={size}
          />
          <Input
            className="col-span-6 [&>div:first-child]:!pt-1"
            label="Address 1"
            name="addressOne"
            size={size}
          />
          <Input
            className="col-span-6 [&>div:first-child]:!pt-1"
            instructionLabel="optional"
            label="Address 2"
            name="addressTwo"
            size={size}
          />
          <Input
            className="col-span-4 [&>div:first-child]:!pt-1"
            label="City"
            name="city"
            size={size}
          />
          <StateDropdown className="col-span-4 pt-1" name="state" size={size} />
          <Input
            className="col-span-4 [&>div:first-child]:!pt-1"
            label="Zip code"
            name="zipCode"
            size={size}
          />
        </Form>
        <div className="flex justify-end lg:justify-start gap-2">
          <Button dark form="address-form" type="submit">
            Save address
          </Button>
          {guestAddress !== undefined ? (
            <Button color="ghost" type="button" onClick={handleAddressChange}>
              Cancel
            </Button>
          ) : undefined}
        </div>
        {errors?.delivery ? (
          <Typography className="mt-4 block text-error">{errors.delivery}</Typography>
        ) : undefined}
      </div>
    )
  }
)

AddressForm.displayName = 'AddressForm'
