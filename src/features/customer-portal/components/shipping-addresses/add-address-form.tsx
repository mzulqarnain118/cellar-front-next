import { useCallback } from 'react'

import { LoadingOverlay } from '@mantine/core'
import { modals } from '@mantine/modals'
import { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { CountryDropdown } from '@/components/country-dropdown'
import { Form } from '@/components/form'
import { ResidentialDropdown } from '@/components/residential-dropdown'
import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'

import { useCreateAddressMutation } from '../../mutations/create-address'

const newAddressFormSchema = z.object({
  addressOne: z.string().min(1, { message: 'Please enter the address.' }),
  addressTwo: z.string().optional(),
  city: z.string().min(1, { message: 'Please enter the city.' }),
  company: z.string().optional(),
  countryName: z.string().min(1, { message: 'Please select the Country' }),
  firstName: z.string().min(1, { message: 'Please enter your first name.' }),
  lastName: z.string().min(1, { message: 'Please enter your last name.' }),
  nickName: z.string().min(1, { message: 'Please enter your nick name.' }),
  phoneNumber: z.string().min(1, { message: 'Please enter a phone number.' }),
  residential: z.string().min(1).optional(),
  state: z.string().min(1, { message: 'Please select the state.' }),
  zipCode: z
    .string()
    .min(1, { message: 'Please enter the zip code.' })
    .max(5, { message: 'The zip code must be 5 numbers.' }),
})

type NewAddressFormSchema = z.infer<typeof newAddressFormSchema>

const defaultValues: NewAddressFormSchema = {
  addressOne: '',
  city: '',
  countryName: '',
  firstName: '',
  lastName: '',
  nickName: '',
  phoneNumber: '',
  residential: '',
  state: '',
  zipCode: '',
}

interface AddAddressFormProps {
  handleClose: () => void
}

export const AddAddressForm = ({ handleClose }: AddAddressFormProps) => {
  const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
  const { mutate: createAddress } = useCreateAddressMutation()

  const onSubmit: SubmitHandler<NewAddressFormSchema> = useCallback(
    ({
      addressOne: addressLineOne,
      addressTwo: addressLineTwo = '',
      city,
      company = '',
      countryName,
      firstName,
      lastName,
      nickName,
      phoneNumber,
      residential,
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
                      ) : undefined}{' '}
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
                    ...entered,
                    FirstName: firstName,
                    LastName: lastName,
                    PhoneNumber: phoneNumber,
                  })
                  handleClose()
                },
                onConfirm: () => {
                  createAddress({
                    ...suggested,
                    FirstName: firstName,
                    LastName: lastName,
                    PhoneNumber: phoneNumber,
                  })
                  handleClose()
                },
              },
              modal: 'confirmation',
              title: 'Confirm address',
            })
          }
        },
        city,
        company,
        countryName,
        firstName,
        lastName,
        nickName,
        provinceId: parseInt(provinceId),
        residential: !!residential,
        zipCode,
      })
    },
    [createAddress, handleClose, validateAddress]
  )

  return (
    <div className="space-y-4">
      <LoadingOverlay visible={isValidatingAddress} />
      <Form
        className="auto-grid-rows grid grid-cols-12 items-start gap-x-8"
        defaultValues={defaultValues}
        id="address-form"
        schema={newAddressFormSchema}
        onSubmit={onSubmit}
      >
        <Input
          className="col-span-12 [&>div:first-child]:!pt-1"
          label="Nick Name"
          name="nickName"
        />
        <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          label="First name"
          name="firstName"
        />
        <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          label="Last name"
          name="lastName"
        />
        <Input
          className="col-span-12 [&>div:first-child]:!pt-1"
          instructionLabel="optional"
          label="Company"
          name="company"
        />
        <Input className="col-span-12 [&>div:first-child]:!pt-1" label="Street" name="addressOne" />
        {/* <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          instructionLabel="optional"
          label="Apt/Suite/Room"
          name="addressTwo"
        /> */}
        <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          label="City"
          name="city"
        />
        <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          label="Postal Code"
          name="zipCode"
        />
        <StateDropdown
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          name="state"
        />
        <CountryDropdown
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          name="countryName"
        />
        <ResidentialDropdown
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          name="residential"
        />
        <Input
          className="col-span-12 md:col-span-6 [&>div:first-child]:!pt-1"
          label="Phone number"
          name="phoneNumber"
        />
      </Form>
      <div className="flex justify-end lg:justify-start">
        <Button dark form="address-form" type="submit">
          Add address
        </Button>
      </div>
    </div>
  )
}
