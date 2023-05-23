import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useWindowScroll } from '@mantine/hooks'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { StateDropdown } from '@/components/state-dropdown'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Input } from '@/core/components/input'

import { useUpdateAddressMutation } from '../../mutations/update-address'
import { CustomerAddress } from '../../queries/get-customer'

const editAddressSchema = z.object({
  city: z.string().min(1, { message: 'Please enter the city.' }),
  company: z.string().optional(),
  displayName: z.string().optional(),
  firstName: z.string().min(1, { message: 'Please enter the first name.' }),
  lastName: z.string().min(1, { message: 'Please enter the last name.' }),
  setAsDefault: z.boolean(),
  state: z.string().min(1, { message: 'Please select the state.' }),
  street1: z.string().min(1, { message: 'Please enter the street.' }),
  street2: z.string().optional(),
  zipCode: z
    .string()
    .min(1, { message: 'Please enter the zip code.' })
    .max(5, { message: 'The zip code cannot be more than 5 digits.' }),
})

type EditAddressSchema = z.infer<typeof editAddressSchema>

interface EditAddressProps {
  address: CustomerAddress
  handleClose: () => void
}

export const EditAddressForm = ({ address, handleClose }: EditAddressProps) => {
  const { mutate: updateAddress } = useUpdateAddressMutation()
  const [_, scrollTo] = useWindowScroll()

  const defaultValues: EditAddressSchema = useMemo(
    () => ({
      city: address.City || '',
      company: address.Company || '',
      displayName: address.NickName || '',
      firstName: address.FirstName || '',
      lastName: address.LastName || '',
      setAsDefault: address.Primary || false,
      state: address.ProvinceID?.toString() || '',
      street1: address.Street1 || '',
      street2: address.Street2 || '',
      zipCode: address.PostalCode?.slice(0, 5) || '',
    }),
    [
      address.City,
      address.Company,
      address.FirstName,
      address.LastName,
      address.NickName,
      address.PostalCode,
      address.Primary,
      address.ProvinceID,
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
    async ({
      city,
      company,
      displayName,
      firstName,
      lastName,
      setAsDefault,
      state,
      street1,
      street2,
      zipCode,
    }) => {
      updateAddress({
        ...address,
        City: city || address.City,
        Company: company || address.Company,
        DisplayName: displayName || address.DisplayName,
        FirstName: firstName || address.FirstName,
        LastName: lastName || address.LastName,
        NickName: displayName || address.DisplayName,
        PostalCode: zipCode || address.PostalCode,
        Primary: setAsDefault || address.Primary,
        ProvinceID: parseInt(state) || address.ProvinceID,
        Street1: street1 || address.Street1,
        Street2: street2 || address.Street2,
      })
      handleClose()
      scrollTo({ y: 0 })
    },
    [address, handleClose, scrollTo, updateAddress]
  )

  return (
    <form className="grid grid-cols-2 items-start gap-x-8" onSubmit={handleSubmit(onSubmit)}>
      <Input
        className="col-span-2"
        error={errors?.displayName?.message}
        instructionLabel="optional"
        label="Address display name"
        {...register('displayName')}
      />
      <Input
        className="col-span-2"
        error={errors?.company?.message}
        instructionLabel="optional"
        label="Company"
        {...register('company')}
      />
      <Input error={errors?.firstName?.message} label="First name" {...register('firstName')} />
      <Input error={errors?.lastName?.message} label="Last name" {...register('lastName')} />
      <Input error={errors?.street1?.message} label="Street 1" {...register('street1')} />
      <Input
        error={errors?.street2?.message}
        instructionLabel="optional"
        label="Street 2"
        {...register('street2')}
      />
      <Input error={errors?.city?.message} label="City" {...register('city')} />
      <StateDropdown
        className="pt-4"
        control={control}
        defaultValue={defaultValues.state}
        name="state"
      />
      <Input
        error={errors?.zipCode?.message}
        label="Zip code"
        {...register('zipCode')}
        pattern="^\d{5}$"
        type="tel"
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
