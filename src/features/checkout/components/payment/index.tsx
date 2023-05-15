import {
  ChangeEventHandler,
  FocusEventHandler,
  MutableRefObject,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  GiftIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Collapse, Select, SelectProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { clsx } from 'clsx'
import Cards, { Focused } from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/es/styles-compiled.css'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutCvv,
  useCheckoutErrors,
  useCheckoutIsAddingCreditCard,
} from '@/lib/stores/checkout'

import { CreditCardForm } from './credit-card-form'
import { formatCVC } from './utils'

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }
const tagIcon = <TagIcon className="mx-3 h-4 w-4" />
const giftIcon = <GiftIcon className="mx-3 h-4 w-4" />

export interface PaymentRefs {
  creditCardRef: MutableRefObject<HTMLInputElement | null>
  cvvRef: MutableRefObject<HTMLInputElement | null>
  giftCardRef: MutableRefObject<HTMLInputElement | null>
  promoCodeRef: MutableRefObject<HTMLInputElement | null>
}

interface PaymentProps {
  opened: boolean
  refs: PaymentRefs
  toggle: () => void
}

export const Payment = memo(({ opened, refs, toggle }: PaymentProps) => {
  const [focused, setFocused] = useState<Focused | undefined>('')
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const cvv = useCheckoutCvv()
  const errors = useCheckoutErrors()
  const isAddingCreditCard = useCheckoutIsAddingCreditCard()
  const { data: addressesAndCreditCards } = useAddressesAndCreditCardsQuery()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const [creditCardFormOpen, { close: closeCreditCardForm, toggle: toggleCreditCardForm }] =
    useDisclosure(false)
  const { setCvv, setErrors, setIsAddingCreditCard } = useCheckoutActions()

  const creditCardsData = useMemo(
    () =>
      addressesAndCreditCards?.creditCards !== undefined
        ? addressesAndCreditCards.creditCards.map(creditCard => ({
            data: creditCard,
            label: creditCard.FriendlyDescription,
            value: creditCard.PaymentToken,
          }))
        : [],
    [addressesAndCreditCards?.creditCards]
  )

  const handleCreditCardChange: SelectProps['onChange'] = useCallback(
    (paymentToken: string | null) => {
      if (
        !!paymentToken &&
        addressesAndCreditCards?.creditCards !== undefined &&
        addressesAndCreditCards.creditCards.length > 0
      ) {
        const correspondingCreditCard = addressesAndCreditCards.creditCards.find(
          cc => cc.PaymentToken === paymentToken
        )
        if (correspondingCreditCard !== undefined) {
          applyCheckoutSelections({
            addressId: activeShippingAddress?.AddressID,
            paymentToken: correspondingCreditCard.PaymentToken,
          })
        }
      }
    },
    [
      activeShippingAddress?.AddressID,
      addressesAndCreditCards?.creditCards,
      applyCheckoutSelections,
    ]
  )

  const promoCodeSubmit = useMemo(
    () => (
      <Button dark className="h-10 rounded-l-none" size="sm" type="button">
        Apply
      </Button>
    ),
    []
  )

  const giftCardSubmit = useMemo(
    () => (
      <Button dark className="h-10 rounded-l-none" size="sm" type="button">
        Apply
      </Button>
    ),
    []
  )

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target }) => {
      target.value = formatCVC(target.value)
      setCvv(target.value)

      if (target.value.length) {
        setErrors(prev => ({ ...prev, payment: { ...prev?.payment, cvv: '' } }))
      }
    },
    [setCvv, setErrors]
  )

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = useCallback(() => {
    setFocused('')
  }, [])

  const handleInputFocus: FocusEventHandler<HTMLInputElement> = useCallback(() => {
    setFocused('cvc')
  }, [])

  useEffect(() => {
    setIsAddingCreditCard(creditCardFormOpen)
  }, [creditCardFormOpen, setIsAddingCreditCard])

  return (
    <>
      <div
        className={clsx('flex cursor-pointer items-center justify-between rounded p-4')}
        role="button"
        tabIndex={0}
        onClick={() => {
          toggle()
          closeCreditCardForm()
        }}
        onKeyDown={() => {
          toggle()
          closeCreditCardForm()
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          3. Payment
        </Typography>
        {opened ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
      </div>

      <div className="space-y-4 px-4">
        <Collapse className="!m-0" in={opened && !creditCardFormOpen} transitionDuration={300}>
          <Select
            classNames={dropdownClassNames}
            data={creditCardsData}
            label="Credit card"
            value={activeCreditCard?.PaymentToken}
            onChange={handleCreditCardChange}
          />
        </Collapse>

        {opened ? (
          <Button
            color="ghost"
            size="sm"
            startIcon={
              creditCardFormOpen ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )
            }
            onClick={toggleCreditCardForm}
          >
            {creditCardFormOpen ? 'Cancel' : 'Add credit card'}
          </Button>
        ) : undefined}

        <Collapse in={creditCardFormOpen}>
          <CreditCardForm ref={refs.creditCardRef} onCreate={closeCreditCardForm} />
        </Collapse>

        {opened && activeCreditCard !== undefined && !isAddingCreditCard ? (
          <>
            <div className="grid items-start justify-center gap-4 lg:flex lg:items-center">
              <div className="[&>div]:m-0 [&>div]:scale-90">
                <Cards
                  preview
                  cvc={cvv}
                  expiry={`${activeCreditCard.ExpirationMonth}/${activeCreditCard.ExpirationYear}`}
                  focused={focused}
                  issuer={activeCreditCard.CreditCardTypeName}
                  name={activeCreditCard.NameOnCard}
                  number={`************${activeCreditCard.DisplayNumber}`}
                />
              </div>
              <div className="grid">
                <Input
                  ref={refs.cvvRef}
                  noSpacing
                  error={errors?.payment?.cvv}
                  label="CVV"
                  name="cvv"
                  pattern="^\d{3,4}$"
                  size="sm"
                  type="tel"
                  value={cvv}
                  onBlur={handleInputBlur}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
                <div>
                  <Typography className="text-sm">Please confirm the CVV for your card:</Typography>
                  <Typography as="p" className="text-14 font-bold text-neutral-dark">
                    {activeCreditCard?.FriendlyDescription}
                  </Typography>
                </div>
              </div>
            </div>
            <div className="grid items-center justify-center lg:flex lg:items-start lg:justify-between lg:gap-4">
              <Input
                ref={refs.promoCodeRef}
                noSpacing
                error={errors?.payment?.promoCode}
                label="Promo code"
                left={tagIcon}
                name="promoCode"
                right={promoCodeSubmit}
                size="sm"
              />
              <Input
                ref={refs.giftCardRef}
                noSpacing
                error={errors?.payment?.giftCardCode}
                label="Gift card code"
                left={giftIcon}
                name="giftCardCode"
                right={giftCardSubmit}
                size="sm"
              />
            </div>
          </>
        ) : undefined}
      </div>
    </>
  )
})

Payment.displayName = 'Payment'
