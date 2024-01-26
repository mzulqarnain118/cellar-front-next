import { ChangeEventHandler, FocusEventHandler, useCallback, useMemo, useState } from 'react'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkbox } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useSession } from 'next-auth/react'
import { Focused } from 'react-credit-cards-2'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { PICK_UP_SHIPPING_METHOD_IDS } from '@/lib/constants/shipping-method'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'
import {
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutErrors,
  useCheckoutGuestAddress,
} from '@/lib/stores/checkout'
import { Address } from '@/lib/types/address'

import { useCreateCreditCardMutation } from '../../mutations/create-credit-card'
import { newAddressFormSchema } from '../delivery/address-form'

import { BillingAddress } from './billing-address'
import {
  CreditCardFormState,
  formatCVC,
  formatCreditCardNumber,
  formatExpirationDate,
  formatZipCode,
} from './utils'

const creditCardFormSchema = z
  .object({
    cardZipCode: z.string().min(5, { message: 'Please enter the zip code.' }),
    cvc: z
      .string()
      .min(3, { message: 'Please enter the CVV.' })
      .max(4, { message: 'The CVV must be 3-4 numbers.' }),
    default: z.boolean(),
    expiry: z.string().min(1, { message: 'Please enter the expiration date.' }),
    name: z.string().min(1, { message: 'Please enter the name.' }),
    number: z
      .string()
      .min(8, { message: 'Please enter the number.' })
      .max(19, { message: 'Please enter the number.' }),
    sameAsShipping: z.boolean(),
  })
  .merge(newAddressFormSchema.partial())

export type CreditCardFormSchema = z.infer<typeof creditCardFormSchema>

const startIcon = <ChevronLeftIcon className="w-4 h-4" />

interface CreditCardFormProps {
  onCancel?: () => void
  onCreate?: () => void
}

export const CreditCardForm = ({ onCancel, onCreate }: CreditCardFormProps) => {
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const checkoutErrors = useCheckoutErrors()
  const guestAddress = useCheckoutGuestAddress()
  const activeAddress = useMemo(
    () => guestAddress || activeShippingAddress,
    [activeShippingAddress, guestAddress]
  )
  const { mutate: createCreditCard } = useCreateCreditCardMutation()
  const { mutate: validateAddress } = useValidateAddressMutation()
  const { data: addressesAndCreditCards } = useAddressesAndCreditCardsQuery()
  const { data: subtotalData } = useGetSubtotalQuery()
  const { data: session } = useSession()

  const formProps: UseFormProps<CreditCardFormSchema> = useMemo(
    () => ({
      defaultValues: {
        cvc: '',
        default: false,
        expiry: '',
        name: '',
        number: '',
        sameAsShipping: subtotalData?.shipping.methodId
          ? PICK_UP_SHIPPING_METHOD_IDS.includes(subtotalData.shipping.methodId) ||
            !addressesAndCreditCards?.addresses.length
          : false,
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(creditCardFormSchema),
    }),
    [addressesAndCreditCards?.addresses.length, subtotalData?.shipping.methodId]
  )
  const methods = useForm<CreditCardFormSchema>(formProps)
  const {
    formState: { errors, dirtyFields, touchedFields },
    handleSubmit,
    register,
    setError,
  } = methods
  const [state, setState] = useState<CreditCardFormState>({
    cardZipCode: '',
    cvc: '',
    expiry: '',
    focus: '',
    issuer: '',
    name: '',
    number: '',
  })
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(({ target }) => {
    if (target.name === 'number') {
      target.value = formatCreditCardNumber(target.value)
    } else if (target.name === 'expiry') {
      target.value = formatExpirationDate(target.value)
    } else if (target.name === 'cvc') {
      target.value = formatCVC(target.value)
    } else if (target.name === 'cardZipCode') {
      target.value = formatZipCode(target.value)
    }
    setState(prev => ({ ...prev, [target.name]: target.value }))
  }, [])

  const handleInputFocus: FocusEventHandler<HTMLInputElement> = useCallback(event => {
    setState(prev => ({ ...prev, focus: event.target.name as Focused }))
  }, [])

  const handleGoBack = useCallback(() => {
    if (onCreate !== undefined) {
      onCreate()
    }
  }, [onCreate])

  const onSubmit: SubmitHandler<CreditCardFormSchema> = useCallback(
    async data => {
      try {
        if (!data.sameAsShipping) {
          newAddressFormSchema.parse(data)
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach(({ code, message, path }) => {
            setError(path[0] as keyof CreditCardFormSchema, { message, type: code })
          })
        }
        return
      }

      const address = {
        addressLineOne: data.sameAsShipping ? activeAddress?.Street1 || '' : data.addressOne || '',
        addressLineTwo: data.sameAsShipping ? activeAddress?.Street2 || '' : data.addressTwo || '',
        city: data.sameAsShipping ? activeAddress?.City || '' : data.city || '',
        company: data.sameAsShipping ? activeAddress?.Company || '' : data.company || '',
        firstName: data.sameAsShipping ? activeAddress?.FirstName || '' : data.firstName || '',
        lastName: data.sameAsShipping ? activeAddress?.LastName || '' : data.lastName || '',
        provinceId: parseInt(
          data.sameAsShipping ? activeAddress?.ProvinceID || '0' : data.state || '0'
        ),
        zipCode: data.sameAsShipping ? activeAddress?.PostalCode || '' : data.zipCode || '',
      }

      let selectedAddress: Address

      // Validate the address.
      validateAddress({
        ...address,
        callback: response => {
          if (response.Success) {
            const suggested: Address | undefined =
              response.Data.ValidatedAddresses?.[0] || response.Data.OriginalAddress
            const entered = response.Data.OriginalAddress
            modals.openContextModal({
              centered: true,
              classNames: {
                title: '!text-lg',
              },
              innerProps: {
                body: (
                  <div className="grid gap-2">
                    {suggested !== undefined ? (
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
                    ) : undefined}
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
                  selectedAddress = {
                    ...entered,
                    FirstName: address.firstName || '',
                    LastName: address.lastName || '',
                  }
                  createCreditCard({
                    address: selectedAddress,
                    creditCard: {
                      cvv: data.cvc,
                      expiry: data.expiry,
                      name: data.name,
                      number: data.number,
                      zipCode: data.cardZipCode,
                    },
                    setAsDefault: data.default,
                  })
                  if (onCreate !== undefined) {
                    onCreate()
                  }
                },
                onConfirm: () => {
                  selectedAddress = {
                    ...suggested,
                    FirstName: address.firstName || '',
                    LastName: address.lastName || '',
                  }
                  createCreditCard({
                    address: selectedAddress,
                    creditCard: {
                      cvv: data.cvc,
                      expiry: data.expiry,
                      name: data.name,
                      number: data.number,
                      zipCode: data.cardZipCode,
                    },
                    setAsDefault: data.default,
                  })
                  if (onCreate !== undefined) {
                    onCreate()
                  }
                },
              },
              modal: 'confirmation',
              title: 'Confirm address',
            })
          }
        },
      })
    },
    [
      activeAddress?.City,
      activeAddress?.Company,
      activeAddress?.FirstName,
      activeAddress?.LastName,
      activeAddress?.PostalCode,
      activeAddress?.ProvinceID,
      activeAddress?.Street1,
      activeAddress?.Street2,
      createCreditCard,
      onCreate,
      setError,
      validateAddress,
    ]
  )

  return (
    <div className="lg:space-y-4">
      {session?.user?.isGuest && activeCreditCard !== undefined ? (
        <Button color="ghost" startIcon={startIcon} onClick={handleGoBack}>
          Never mind
        </Button>
      ) : undefined}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid items-start lg:grid-cols-2 lg:gap-4">
            <Input
              error={errors.name?.message}
              label="Name"
              size="sm"
              {...register('name', { onChange: handleInputChange })}
              onFocus={handleInputFocus}
            />
            <Input
              error={errors.number?.message}
              label="Card number"
              size="sm"
              {...register('number', { onChange: handleInputChange })}
              // pattern="[\d| ]{16,22}"
              type="tel"
              onFocus={handleInputFocus}
            />
          </div>
          <div className="grid grid-cols-3 items-start gap-4">
            <Input
              error={errors.expiry?.message}
              label="Expiry"
              size="sm"
              {...register('expiry', { onChange: handleInputChange })}
              pattern="\d\d/\d\d"
              type="tel"
              onFocus={handleInputFocus}
            />
            <Input
              dirty={dirtyFields.cvc}
              error={errors.cvc?.message}
              label="CVV"
              size="sm"
              {...register('cvc', {
                maxLength: 4,
                minLength: 3,
                onChange: handleInputChange,
              })}
              pattern="^\d{3,4}$"
              type="tel"
                          touched={touchedFields.cvc}
              onFocus={handleInputFocus}
            />
            <Input
              error={errors.cardZipCode?.message}
              label="Zip code"
              size="sm"
              {...register('cardZipCode', { onChange: handleInputChange })}
              pattern="^\d{5}$"
              type="tel"
              onFocus={handleInputFocus}
            />
          </div>
          <input name="issuer" type="hidden" value={state.issuer} />
          <div className="mt-4 space-y-4">
            <BillingAddress />
            {session?.user?.isGuest ? undefined : (
              <Checkbox color="dark" label="Set as default" {...register('default')} />
            )}
          </div>
          <div className="mt-4 flex justify-end lg:justify-start gap-2">
            <Button dark type="submit">
              Save credit card
            </Button>
            <Button color="ghost" type="button" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          {checkoutErrors?.payment?.form ? (
            <Typography className="mt-4 block text-error">
              {checkoutErrors.payment?.form}
            </Typography>
          ) : undefined}
        </form>
      </FormProvider>
    </div>
  )
}
