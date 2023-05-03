import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingOverlay } from '@mantine/core'
import { modals } from '@mantine/modals'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useCreateAddressMutation } from '@/lib/mutations/address/create'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'

const newAddressFormSchema = z.object({
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

type NewAddressFormSchema = z.infer<typeof newAddressFormSchema>

interface AddressFormProps {
  onCreateAddress?: () => void
}

export const AddressForm = ({ onCreateAddress }: AddressFormProps) => {
  const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
  const { mutate: createAddress, isLoading: isCreatingAddress } = useCreateAddressMutation()
  const formProps: UseFormProps<NewAddressFormSchema> = useMemo(
    () => ({
      defaultValues: {
        addressOne: '',
        city: '',
        firstName: '',
        lastName: '',
        state: '',
        zipCode: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(newAddressFormSchema),
    }),
    []
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<NewAddressFormSchema>(formProps)
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
                      <strong>Suggested address</strong>
                      <Typography>{suggested.Street1}</Typography>
                      {suggested.Street2 ? <Typography>{suggested.Street2}</Typography> : undefined}
                      <Typography>
                        {suggested.City}, {suggested.ProvinceAbbreviation} {suggested.PostalCode}
                      </Typography>
                    </div>
                    <div className="grid">
                      <strong>Entered address</strong>
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
                        onCreateAddress()
                      }
                    },
                  })
                },
                onConfirm: () => {
                  createAddress({
                    address: { ...suggested, FirstName: firstName, LastName: lastName },
                    callback: response => {
                      if (response.Success && onCreateAddress !== undefined) {
                        onCreateAddress()
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
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <LoadingOverlay visible={isCreatingAddress || isValidatingAddress} />
      <div className="auto-grid-rows grid grid-cols-12 items-start gap-x-8">
        <Input
          className="col-span-12 [&>div:first-child]:!pt-1"
          error={errors.company?.message}
          id="company"
          instructionLabel="optional"
          label="Company"
          {...register('company')}
        />
        <Input
          className="col-span-6 [&>div:first-child]:!pt-1"
          error={errors.firstName?.message}
          id="firstName"
          label="First name"
          {...register('firstName')}
        />
        <Input
          className="col-span-6 [&>div:first-child]:!pt-1"
          error={errors.lastName?.message}
          id="lastName"
          label="Last name"
          {...register('lastName')}
        />
        <Input
          className="col-span-6 [&>div:first-child]:!pt-1"
          error={errors.addressOne?.message}
          id="addressOne"
          label="Address 1"
          {...register('addressOne')}
        />
        <Input
          className="col-span-6 [&>div:first-child]:!pt-1"
          error={errors.addressTwo?.message}
          id="addressTwo"
          instructionLabel="optional"
          label="Address 2"
          {...register('addressTwo')}
        />
        <Input
          className="col-span-4 [&>div:first-child]:!pt-1"
          error={errors.city?.message}
          id="city"
          label="City"
          {...register('city')}
        />
        <StateDropdown className="col-span-4 pt-1" control={control} name="state" />
        <Input
          className="col-span-4 [&>div:first-child]:!pt-1"
          error={errors.zipCode?.message}
          id="zipCode"
          label="Zip code"
          {...register('zipCode')}
        />
      </div>
      <div className="flex justify-end lg:justify-start">
        <Button type="submit">Save address</Button>
      </div>
    </form>
  )
}
