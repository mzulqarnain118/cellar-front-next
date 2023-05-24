import { ChangeEventHandler, FocusEventHandler, useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingOverlay } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import Cards, { Focused } from 'react-credit-cards-2'
import { FormProvider, SubmitHandler, UseFormProps, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { newAddressFormSchema } from '@/features/checkout/components/delivery/address-form'
import { BillingAddress } from '@/features/checkout/components/payment/billing-address'
import {
  CreditCardFormState,
  formatCVC,
  formatCreditCardNumber,
  formatExpirationDate,
  formatZipCode,
} from '@/features/checkout/components/payment/utils'
import { useValidateAddressMutation } from '@/lib/mutations/address/validate'
import { Address } from '@/lib/types/address'

import { useCreateCreditCardMutation } from '../../mutations/create-credit-card'

import 'react-credit-cards-2/dist/es/styles-compiled.css'

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
  })
  .merge(newAddressFormSchema.partial())

type CreditCardFormSchema = z.infer<typeof creditCardFormSchema>

interface AddCreditCardFormProps {
  handleClose: () => void
}

export const AddCreditCardForm = ({ handleClose }: AddCreditCardFormProps) => {
  const { mutate: createCreditCard } = useCreateCreditCardMutation()
  const { mutate: validateAddress, isLoading: isValidatingAddress } = useValidateAddressMutation()
  const [_, scrollTo] = useWindowScroll()

  const formProps: UseFormProps<CreditCardFormSchema> = useMemo(
    () => ({
      defaultValues: {
        cvc: '',
        default: false,
        expiry: '',
        name: '',
        number: '',
      },
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: zodResolver(creditCardFormSchema),
    }),
    []
  )

  const methods = useForm<CreditCardFormSchema>(formProps)
  const {
    formState: { errors },
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

  const onSubmit: SubmitHandler<CreditCardFormSchema> = useCallback(
    async data => {
      try {
        newAddressFormSchema.parse(data)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach(({ code, message, path }) => {
            setError(path[0] as keyof CreditCardFormSchema, { message, type: code })
          })
        }
        return
      }

      const address = {
        addressLineOne: data.addressOne || '',
        addressLineTwo: data.addressTwo || '',
        city: data.city || '',
        company: data.company || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        provinceId: parseInt(data.state || '0'),
        zipCode: data.zipCode || '',
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
                  handleClose()
                  scrollTo({ y: 0 })
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
                  handleClose()
                  scrollTo({ y: 0 })
                },
              },
              modal: 'confirmation',
              title: 'Confirm address',
            })
          }
        },
      })
    },
    [createCreditCard, handleClose, scrollTo, setError, validateAddress]
  )

  return (
    <div className="lg:space-y-4">
      <LoadingOverlay visible={isValidatingAddress} />
      <Cards
        cvc={state.cvc}
        expiry={state.expiry}
        focused={state.focus}
        issuer={state.issuer}
        name={state.name}
        number={state.number}
      />
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
            <BillingAddress noCheckbox />
            <Checkbox color="dark" label="Set as default" {...register('default')} />
          </div>
          <div className="mt-4 flex justify-end lg:justify-start">
            <Button dark type="submit">
              Add credit card
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
