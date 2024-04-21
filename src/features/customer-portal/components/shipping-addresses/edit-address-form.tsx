import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { CountryDropdown } from '@/components/country-dropdown'
import { ResidentialDropdown } from '@/components/residential-dropdown'
import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'

import { useUpdateAddressMutation } from '../../mutations/update-address'
import { CustomerAddress } from '../../queries/customer'

const editAddressSchema = z.object({
  city: z.string().min(1, { message: 'Please enter the city.' }),
  company: z.string().optional(),
  countryName: z.string().min(1, { message: 'Please select the Country' }),
  firstName: z.string().min(1, { message: 'Please enter the first name.' }),
  lastName: z.string().min(1, { message: 'Please enter the last name.' }),
  nickName: z.string().optional(),
  phoneNumber: z.string().min(1, { message: 'Please enter a phone number.' }),
  residential: z.string().min(1).optional(),
  setAsDefault: z.boolean(),
  state: z.string().min(1, { message: 'Please select the state.' }),
  street1: z.string().min(1, { message: 'Please enter the street.' }),
  street2: z.string().optional(),
  zipCode: z
    .string()
    .min(1, { message: 'Please enter the zip code.' })
    .max(5, { message: 'The zip code cannot be more than 5 digits.' }),
})

// const newAddressFormSchema = z.object({
//   addressOne: z.string().min(1, { message: 'Please enter the address.' }),
//   addressTwo: z.string().optional(),
//   city: z.string().min(1, { message: 'Please enter the city.' }),
//   company: z.string().optional(),
//   countryName: z.string().min(1, { message: 'Please select the Country' }),
//   firstName: z.string().min(1, { message: 'Please enter the first name.' }),
//   lastName: z.string().min(1, { message: 'Please enter the last name.' }),
//   nickName: z.string().optional(),
//   phoneNumber: z.string().min(1, { message: 'Please enter a phone number.' }),
//   residental: z.string().min(1).optional(),
//   state: z.string().min(1, { message: 'Please select the state.' }),
//   zipCode: z
//     .string()
//     .min(1, { message: 'Please enter the zip code.' })
//     .max(5, { message: 'The zip code must be 5 numbers.' }),
// })

type EditAddressSchema = z.infer<typeof editAddressSchema>

interface EditAddressProps {
  address: CustomerAddress
  handleClose: () => void
}

export const EditAddressForm = ({ address, handleClose }: EditAddressProps) => {
  console.log('🚀 ~ EditAddressForm ~ address:', address)
  const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()

  const { mutate: updateAddress } = useUpdateAddressMutation()
  const [_, scrollTo] = useWindowScroll()

  const defaultValues: EditAddressSchema = useMemo(
    () => ({
      city: address.City || '',
      company: address.Company || '',
      countryName: address.CountryName || '',
      firstName: address.FirstName || '',
      lastName: address.LastName || '',
      nickName: address.NickName || '',
      phoneNumber: address.PhoneNumber || '',
      residental: address.Residential || '',
      setAsDefault: address.Primary || false,
      state: address.ProvinceID?.toString() || '',
      street1: address.Street1 || '',
      street2: address.Street2 || '',
      zipCode: address.PostalCode?.slice(0, 5) || '',
    }),
    [
      address.City,
      address.Company,
      address.CountryName,
      address.FirstName,
      address.LastName,
      address.NickName,
      address.PhoneNumber,
      address.PostalCode,
      address.Primary,
      address.ProvinceID,
      address.Residential,
      address.Street1,
      address.Street2,
    ]
  )

  const formProps: UseFormProps<EditAddressSchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(editAddressSchema),
    }),
    [defaultValues]
  )

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EditAddressSchema>(formProps)

  const onSubmit: SubmitHandler<EditAddressSchema> = useCallback(
    ({
      city,
      company,
      countryName,
      nickName,
      firstName,
      lastName,
      phoneNumber,
      residential,
      setAsDefault,
      state,
      street1,
      street2,
      zipCode,
    }) => {
      validateAddress({
        ...address,
        addressLineOne: street1 || address.Street1 || '',
        addressLineTwo: street2 || address.Street2 || '',
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
                  updateAddress({
                    ...entered,
                    AddressID: address.AddressID || 0,
                    City: city || address.City || '',
                    Company: company || address.Company || '',
                    CountryName: countryName || address.CountryName || '',
                    FirstName: firstName || address.FirstName || '',
                    LastName: lastName || address.LastName || '',
                    NickName: nickName || address.NickName || '',
                    PhoneNumber: phoneNumber || address.PhoneNumber || '',
                    PostalCode: zipCode || address.PostalCode || '',
                    Primary: setAsDefault || address.Primary || false,
                    ProvinceID: parseInt(state) || address.ProvinceID || '',
                    Residential: !!residential || address.Residential || false,
                    Street1: street1 || address.Street1 || '',
                    Street2: street2 || address.Street2 || '',
                  })
                  handleClose()
                },
                onConfirm: () => {
                  updateAddress({
                    ...suggested,
                    AddressID: address.AddressID || 0,
                    City: city || address.City || '',
                    Company: company || address.Company || '',
                    CountryName: countryName || address.CountryName || '',
                    FirstName: firstName || address.FirstName || '',
                    LastName: lastName || address.LastName || '',
                    NickName: nickName || address.NickName || '',
                    PhoneNumber: phoneNumber || address.PhoneNumber || '',
                    PostalCode: zipCode || address.PostalCode || '',
                    Primary: setAsDefault || address.Primary || false,
                    ProvinceID: parseInt(state) || address.ProvinceID || '',
                    Residential: !!residential || address.Residential || false,
                    Street1: street1 || address.Street1 || '',
                    Street2: street2 || address.Street2 || '',
                  })
                  handleClose()
                },
              },
              modal: 'confirmation',
              title: 'Confirm address',
            })
          }
        },
        city: city || address.City || '',
        company: company || address.Company || '',
        countryName: countryName || address.CountryName || '',
        firstName: firstName || address.FirstName || '',
        lastName: lastName || address.LastName || '',
        nickName: nickName || address.NickName || '',
        provinceId: parseInt(state) || address.ProvinceID || '',
        residential: !!residential || address.Residential || false,
        zipCode: zipCode || address.PostalCode || '',
      })
    },
    [address, handleClose, updateAddress, validateAddress]
  )

  return (
    <form className="grid grid-cols-2 items-start gap-x-8" onSubmit={handleSubmit(onSubmit)}>
      <Input
        className="col-span-2"
        error={errors?.nickName?.message}
        instructionLabel="optional"
        label="Nick Name"
        {...register('nickName')}
      />
      <Input
        className="col-span-2 md:col-span-1"
        error={errors?.firstName?.message}
        label="First name"
        {...register('firstName')}
      />
      <Input
        className="col-span-2 md:col-span-1"
        error={errors?.lastName?.message}
        label="Last name"
        {...register('lastName')}
      />
      <Input
        className="col-span-2"
        error={errors?.company?.message}
        instructionLabel="optional"
        label="Company"
        {...register('company')}
      />
      <Input
        className="col-span-2"
        error={errors?.street1?.message}
        label="Street"
        {...register('street1')}
      />
      {/* <Input
        error={errors?.street2?.message}
        instructionLabel="optional"
        label="Street 2"
        {...register('street2')}
      /> */}
      <Input
        className="col-span-2 md:col-span-1"
        error={errors?.city?.message}
        label="City"
        {...register('city')}
      />
      <Input
        className="col-span-2 md:col-span-1"
        error={errors?.zipCode?.message}
        label="Zip code"
        {...register('zipCode')}
        pattern="^\d{5}$"
        type="tel"
      />
      <StateDropdown
        className="col-span-2 md:col-span-1 pt-4"
        control={control}
        defaultValue={defaultValues.state}
        name="state"
      />
      <CountryDropdown
        className="col-span-2 md:col-span-1 pt-4"
        control={control}
        defaultValue={defaultValues.countryName}
        name="countryName"
      />
      <ResidentialDropdown
        className="col-span-2 md:col-span-1 pt-4"
        control={control}
        defaultValue={defaultValues.residential}
        name="residential"
      />
      <Input
        className="col-span-2 md:col-span-1"
        error={errors?.phoneNumber?.message}
        label="Phone number"
        {...register('phoneNumber')}
        inputMode="numeric"
      />
      <Checkbox
        className="col-span-2 my-4"
        color="dark"
        error={errors?.setAsDefault?.message}
        label="Set as default"
        {...register('setAsDefault')}
      />
      <Button color="ghost" type="button" onClick={handleClose}>
        Cancel
      </Button>
      <Button dark type="submit">
        Save address changes
      </Button>
    </form>
  )
}
