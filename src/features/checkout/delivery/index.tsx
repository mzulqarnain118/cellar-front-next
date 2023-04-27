import { useCallback, useMemo } from 'react'

import { CheckCircleIcon, ChevronRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Collapse, LoadingOverlay, Paper, Text, TextInput, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { StateDropdown } from '@/components/state-dropdown'
import { useCreateAddressMutation } from '@/lib/mutations/address/create'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useCheckoutActions } from '@/lib/stores/checkout'

const deliverySchema = z.object({
  addressOne: z.string().min(1, { message: 'Please enter the address.' }),
  addressTwo: z.string().optional(),
  city: z.string().min(1, { message: 'Please enter the city.' }),
  firstName: z.string().min(1, { message: 'Please enter the first name.' }),
  lastName: z.string().min(1, { message: 'Please enter the last name.' }),
  state: z.string().min(1, { message: 'Please select the state.' }),
  zipCode: z.string().min(1, { message: 'Please enter the zip code.' }),
})

export type DeliverySchema = z.infer<typeof deliverySchema>

export const Delivery = () => {
  const { setActiveTab, setCompletedTabs } = useCheckoutActions()
  const [addAddressTwo, { toggle: toggleAddAddressTwo }] = useDisclosure(false)

  const defaultValues: Partial<DeliverySchema> = useMemo(
    () => ({
      addressOne: '',
      city: '',
      firstName: '',
      lastName: '',
      state: '',
      zipCode: '',
    }),
    []
  )

  const options: UseFormProps<DeliverySchema> = useMemo(
    () => ({
      defaultValues,
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      resolver: zodResolver(deliverySchema),
    }),
    [defaultValues]
  )
  const {
    control,
    formState: { dirtyFields, errors, isSubmitting, isValid },
    handleSubmit,
    register,
  } = useForm<DeliverySchema>(options)

  const rightIcon = useMemo(() => <ChevronRightIcon className="h-6 w-6" />, [])
  const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
  const { mutate: createAddress, isLoading: isCreatingAddress } = useCreateAddressMutation()
  const { mutate: applyCheckoutSelections, isLoading: isApplyingCheckoutSelections } =
    useApplyCheckoutSelectionsMutation()
  const isLoading =
    isSubmitting || isValidatingAddress || isCreatingAddress || isApplyingCheckoutSelections
  const onSubmit: SubmitHandler<DeliverySchema> = useCallback(
    async ({
      addressOne: addressLineOne,
      addressTwo: addressLineTwo = '',
      city,
      firstName,
      lastName,
      state,
      zipCode,
    }) => {
      validateAddress({
        addressLineOne,
        addressLineTwo,
        callback: response => {
          if (response.Success) {
            const { OriginalAddress, ValidatedAddresses } = response.Data
            modals.openConfirmModal({
              centered: true,
              children: (
                <div className="flex flex-col space-y-4">
                  <Title order={6}>Please confirm your address</Title>
                  <div className="rounded bg-accent-50 p-2">
                    <Text className="font-bold">You entered:</Text>
                    {!!OriginalAddress.Company && <Text>{OriginalAddress.Company}</Text>}
                    <Text>{OriginalAddress.Street1}</Text>
                    {!!OriginalAddress.Street2 && <Text>{OriginalAddress.Street2}</Text>}
                    <Text>
                      {OriginalAddress.City}, {OriginalAddress.ProvinceAbbreviation}{' '}
                      {OriginalAddress.PostalCode}
                    </Text>
                  </div>
                  <div className="rounded bg-accent-50 p-2">
                    <Text className="font-bold">We suggest:</Text>
                    {!!ValidatedAddresses[0].Company && (
                      <Text>{ValidatedAddresses[0].Company}</Text>
                    )}
                    <Text>{ValidatedAddresses[0].Street1}</Text>
                    {!!ValidatedAddresses[0].Street2 && (
                      <Text>{ValidatedAddresses[0].Street2}</Text>
                    )}
                    <Text>
                      {ValidatedAddresses[0].City}, {ValidatedAddresses[0].ProvinceAbbreviation}{' '}
                      {ValidatedAddresses[0].PostalCode}
                    </Text>
                  </div>
                </div>
              ),
              closeOnConfirm: false,
              confirmProps: {
                color: 'brand',
              },
              labels: { cancel: 'Use original address', confirm: 'Use suggested address' },
              onCancel: () => {
                const address = response.Data.OriginalAddress
                createAddress({
                  address,
                  callback: () => {
                    applyCheckoutSelections({ addressId: address.AddressID })
                  },
                })
                setCompletedTabs(prev => [...prev, 'delivery'])
                setActiveTab('shipping')
                modals.closeAll()
              },
              onConfirm: () => {
                const address = response.Data.ValidatedAddresses[0]
                createAddress({
                  address,
                  callback: () => {
                    applyCheckoutSelections({ addressId: address.AddressID })
                  },
                })
                setCompletedTabs(prev => [...prev, 'delivery'])
                setActiveTab('shipping')
                modals.closeAll()
              },
            })
          }
        },
        city,
        company: '',
        firstName,
        lastName,
        provinceId: parseInt(state) || 48,
        zipCode,
      })
    },
    [applyCheckoutSelections, createAddress, setActiveTab, setCompletedTabs, validateAddress]
  )

  return (
    <>
      <Paper mt="lg" p="lg">
        <LoadingOverlay visible={isLoading} />
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Title order={3}>Delivery address</Title>
          <TextInput
            error={errors.firstName?.message}
            label="First Name"
            rightSection={
              errors.firstName?.message === undefined && dirtyFields.firstName ? (
                <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
              ) : undefined
            }
            {...register('firstName')}
          />
          <TextInput
            error={errors.lastName?.message}
            label="Last Name"
            rightSection={
              errors.lastName?.message === undefined && dirtyFields.lastName ? (
                <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
              ) : undefined
            }
            {...register('lastName')}
          />
          <TextInput
            error={errors.addressOne?.message}
            label="Address 1"
            rightSection={
              errors.addressOne?.message === undefined && dirtyFields.addressOne ? (
                <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
              ) : undefined
            }
            {...register('addressOne')}
          />
          <Button
            compact
            leftIcon={
              addAddressTwo ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />
            }
            variant="light"
            onClick={toggleAddAddressTwo}
          >
            {addAddressTwo ? 'Remove' : 'Add'} Address 2
          </Button>

          <Collapse in={addAddressTwo}>
            <TextInput
              error={errors.addressTwo?.message}
              label="Address 2"
              rightSection={
                errors.addressTwo?.message === undefined && dirtyFields.addressTwo ? (
                  <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
                ) : undefined
              }
              {...register('addressTwo')}
            />
          </Collapse>
          <TextInput
            error={errors.city?.message}
            label="City"
            rightSection={
              errors.city?.message === undefined && dirtyFields.city ? (
                <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
              ) : undefined
            }
            {...register('city')}
          />
          <StateDropdown control={control} name="state" />
          <TextInput
            error={errors.zipCode?.message}
            label="Zip Code"
            rightSection={
              errors.zipCode?.message === undefined && dirtyFields.zipCode ? (
                <CheckCircleIcon className="h-5 w-5 stroke-2 text-success" />
              ) : undefined
            }
            {...register('zipCode')}
          />
          <Button
            fullWidth
            color="dark"
            disabled={!isValid}
            rightIcon={rightIcon}
            size="md"
            type="submit"
          >
            Continue
          </Button>
        </form>
      </Paper>
    </>
  )
}
