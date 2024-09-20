import { useEffect, useState } from 'react'

import { Checkbox, Collapse } from '@mantine/core'
import { useFormContext } from 'react-hook-form'

import { StateDropdown } from '@/components/state-dropdown'
import { Input } from '@/core/components/input'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import { useCheckoutIsPickUp } from '@/lib/stores/checkout'

import { CreditCardFormSchema } from './credit-card-form'

interface BillingAddressProps {
  noCheckbox?: boolean,
  shippingMethods?: number
}

export const BillingAddress = ({ noCheckbox = false , shippingMethods}: BillingAddressProps) => {
  const [sameAsShipping, setSameAsShipping] = useState(false)
  const isPickUp = useCheckoutIsPickUp()
  const { data: shippingMethodsData } = useShippingMethodsQuery()
  const {
    control,
    formState: { errors },
    register,
    resetField,
    watch,
  } = useFormContext<CreditCardFormSchema>()


  useEffect(() => {
    setSameAsShipping(!watch('sameAsShipping'))
     }, [watch('sameAsShipping')])
  return (
    <>
      {noCheckbox ? undefined : (
        <Checkbox
          color="dark"
          disabled={shippingMethods ?  !shippingMethods : shippingMethodsData === undefined || shippingMethodsData?.length === 0 }
          error={errors.sameAsShipping?.message}
          label="Billing address same as shipping address"
          {...register('sameAsShipping', {
            onChange: () => {
              resetField('addressOne')
              resetField('addressTwo')
              resetField('city')
              resetField('company')
              resetField('firstName')
              resetField('lastName')
              resetField('state')
              resetField('zipCode')
            },
          })}
        />
      )}

      <Collapse in={isPickUp ? true : sameAsShipping}>
      <div className="auto-grid-rows grid grid-cols-2 items-start gap-x-8">
  <Input
    className="col-span-2 [&>div:first-child]:!pt-1"
    error={errors.company?.message}
    id="company"
    instructionLabel="optional"
    label="Company"
    size="sm"
    {...register('company')}
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.firstName?.message}
    id="firstName"
    label="First name"
    size="sm"
    {...register('firstName', { deps: ['sameAsShipping'], required: !sameAsShipping })}
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.lastName?.message}
    id="lastName"
    label="Last name"
    size="sm"
    {...register('lastName', { deps: ['sameAsShipping'], required: !sameAsShipping })}
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.addressOne?.message}
    id="addressOne"
    label="Address 1"
    size="sm"
    {...register('addressOne', { deps: ['sameAsShipping'], required: !sameAsShipping })}
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.addressTwo?.message}
    id="addressTwo"
    instructionLabel="optional"
    label="Address 2"
    size="sm"
    {...register('addressTwo')}
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.city?.message}
    id="city"
    label="City"
    size="sm"
    {...register('city', { deps: ['sameAsShipping'], required: !sameAsShipping })}
  />
  <StateDropdown
    className="col-span-2 sm:col-span-1"
    control={control}
    name="state"
    size="sm"
  />
  <Input
    className="col-span-2 sm:col-span-1 [&>div:first-child]:!pt-1"
    error={errors.zipCode?.message}
    id="zipCode"
    label="Zip code"
    size="sm"
    {...register('zipCode', { deps: ['sameAsShipping'], required: !sameAsShipping })}
  />
</div>
      </Collapse>
    </>
  )
}
