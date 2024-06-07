import { ChangeEventHandler, MutableRefObject, memo, useCallback, useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  GiftIcon,
  PlusIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { Collapse, Select, SelectProps } from '@mantine/core'
import { useDisclosure, useMergedRef, useScrollIntoView, useWindowScroll } from '@mantine/hooks'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'
import 'react-credit-cards-2/dist/es/styles-compiled.css'
import { useIsFirstRender } from 'usehooks-ts'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import { wait } from '@/core/utils/time'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useCartQuery } from '@/lib/queries/cart'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutCvv,
  useCheckoutErrors,
  useCheckoutGuestCreditCard,
} from '@/lib/stores/checkout'

import { useRedeemGiftCardCheckoutMutation } from '../../mutations/redeem-gift-card-checkout'
import { useRedeemOfferCheckoutMutation } from '../../mutations/redeem-offer-checkout'
import { useSkyWalletQuery } from '../../queries/sky-wallet'

import { CreditCardForm } from './credit-card-form'
import { formatCVC } from './utils'

const SkyWallet = dynamic(() => import('./sky-wallet').then(({ SkyWallet }) => SkyWallet), {
  ssr: false,
})

const dropdownClassNames = { input: 'h-10', item: 'text-14', label: 'text-14' }
const tagIcon = <TagIcon className="mx-3 h-4 w-4" />
const giftIcon = <GiftIcon className="mx-3 h-4 w-4" />

export interface PaymentRefs {
  creditCardRef: MutableRefObject<HTMLInputElement | null>
  cvvRef: MutableRefObject<HTMLInputElement | null>
  giftCardRef: MutableRefObject<HTMLInputElement | null>
  promoCodeRef: MutableRefObject<HTMLInputElement | null>
}

const plusIcon = <PlusIcon className="h-4 w-4" />
const scrollIntoViewSettings = { duration: 500, offset: 120 }
interface PaymentProps {
  opened: boolean
  refs: PaymentRefs
  toggle: () => void
  cartTotalData: any
}

export const Payment = memo(({ opened, refs, toggle, cartTotalData }: PaymentProps) => {
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const cvv = useCheckoutCvv()
  const { data: cart } = useCartQuery()
  const errors = useCheckoutErrors()
  const { data: addressesAndCreditCards } = useAddressesAndCreditCardsQuery()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const [
    creditCardFormOpen,
    { close: closeCreditCardForm, open: openCreditCardForm, toggle: toggleCreditCardForm },
  ] = useDisclosure(false)
  const { setCvv, setErrors, setIsAddingCreditCard } = useCheckoutActions()
  const { data: session } = useSession()
  const [_, scrollTo] = useWindowScroll()
  const isFirstRender = useIsFirstRender()
  const [showCreditCard, { open: openShowCreditCard }] = useDisclosure(
    opened && activeCreditCard !== undefined && !creditCardFormOpen
  )
  const guestCreditCard = useCheckoutGuestCreditCard()
  const { targetRef, scrollIntoView: scrollCvvIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const cvvRef = useMergedRef(targetRef, refs.cvvRef)

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

  const {
    data: skyWallet,
    isFetching: skyWalletFetching,
    isLoading: skyWalletLoading,
    refetch: refetchSkyWallet,
  } = useSkyWalletQuery()

  // Promo Code
  const { mutate: redeemCouponCheckout, isSuccess: redeemOfferCheckoutFinished } =
    useRedeemOfferCheckoutMutation()

  const handlePromoCodeSubmit = async (): Promise<void> =>
    redeemCouponCheckout({
      CouponCode: refs.promoCodeRef.current?.value,
      CartId: cart?.id,
    })

  const promoCodeSubmit = useMemo(
    () => (
      <Button
        dark
        className="h-10 rounded-l-none"
        size="sm"
        type="button"
        onClick={handlePromoCodeSubmit}
      >
        Apply
      </Button>
    ),
    [cart?.id]
  )

  // Gift Card Code
  const { mutate: redeemGiftCardCheckout, isSuccess: redeemGiftCardCheckoutFinished } =
    useRedeemGiftCardCheckoutMutation()

  const handleGiftCardSubmit = async (): Promise<void> =>
    redeemGiftCardCheckout({
      giftCard: refs.giftCardRef.current?.value,
    })

  const giftCardSubmit = useMemo(
    () => (
      <Button
        dark
        className="h-10 rounded-l-none"
        size="sm"
        type="button"
        onClick={handleGiftCardSubmit}
      >
        Apply
      </Button>
    ),
    []
  )

  useEffect(() => {
    if (redeemGiftCardCheckoutFinished || redeemOfferCheckoutFinished) {
      refetchSkyWallet()
    }
  }, [redeemGiftCardCheckoutFinished, redeemOfferCheckoutFinished])

  useEffect(() => {
    if (redeemOfferCheckoutFinished) {
      refs.promoCodeRef.current.value = ''
    }
  }, [redeemOfferCheckoutFinished])

  useEffect(() => {
    if (redeemGiftCardCheckoutFinished) {
      refs.giftCardRef.current.value = ''
    }
  }, [redeemGiftCardCheckoutFinished])

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

  const handleChangeCreditCard = useCallback(() => {
    openCreditCardForm()
  }, [openCreditCardForm])

  const handleCreateCreditCard = useCallback(async () => {
    scrollTo({ y: 0 })
    closeCreditCardForm()
    await wait(1500)
    scrollCvvIntoView()
    targetRef.current.focus()
    openShowCreditCard()
  }, [closeCreditCardForm, openShowCreditCard, scrollCvvIntoView, scrollTo, targetRef])

  const handleCancelCreate = useCallback(() => {
    scrollTo({ y: 0 })
    closeCreditCardForm()
  }, [closeCreditCardForm, scrollTo])

  const creditCard = useMemo(
    () => (session?.user?.isGuest ? guestCreditCard : activeCreditCard),
    [activeCreditCard, guestCreditCard, session?.user?.isGuest]
  )

  const hasPaymentError = useMemo(
    () =>
      errors?.payment !== undefined ? Object.values(errors?.payment).some(value => !!value) : false,
    [errors?.payment]
  )

  useEffect(() => {
    setIsAddingCreditCard(creditCardFormOpen)
  }, [creditCardFormOpen, setIsAddingCreditCard])

  useEffect(() => {
    if (!isFirstRender && session?.user?.isGuest && creditCard === undefined) {
      openCreditCardForm()
    }
  }, [creditCard, isFirstRender, openCreditCardForm, session])

  useEffect(() => {
    if (!isFirstRender) {
      if (creditCard !== undefined) {
        openShowCreditCard()
      }
    }
  }, [
    creditCard,
    activeShippingAddress,
    guestCreditCard,
    isFirstRender,
    openShowCreditCard,
    session,
    targetRef,
  ])

  return (
    <div className={clsx('py-4 rounded', hasPaymentError && '')}>
      <div
        className={clsx('flex cursor-pointer items-center justify-between rounded p-4')}
        role="button"
        tabIndex={0}
        onClick={() => {
          toggle()
          if (creditCard !== undefined) {
            closeCreditCardForm()
          } else {
            openCreditCardForm()
          }
        }}
        onKeyDown={event => {
          if (event.key === 'Escape' || event.key === 'Space') {
            toggle()
            if (creditCard !== undefined) {
              closeCreditCardForm()
            } else {
              openCreditCardForm()
            }
          }
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          3. Payment
        </Typography>
        {opened ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
      </div>

      <div className="space-y-4 px-4">
        <Collapse className="!m-0" in={opened && !creditCardFormOpen} transitionDuration={300}>
          <div className="grid grid-cols-[1fr_auto] items-start gap-4">
            {session?.user?.isGuest ? (
              <div className="grid self-center">
                <Typography className="font-bold">
                  {creditCard?.NameOnCard} - {creditCard?.CreditCardTypeName} ending in{' '}
                  {creditCard?.DisplayNumber}
                </Typography>
              </div>
            ) : (
              <Select
                classNames={dropdownClassNames}
                data={creditCardsData}
                label="Credit card"
                value={creditCard?.PaymentToken}
                onChange={handleCreditCardChange}
              />
            )}
            <Input
              ref={cvvRef}
              noSpacing
              className="mt-0.5"
              data-testid="cvv"
              error={errors?.payment?.cvv}
              inputClassName={clsx(errors?.payment?.cvv && '!border-error focus:!border-error')}
              label="CVV"
              name="cvv"
              pattern="^\d{3,4}$"
              size="sm"
              type="tel"
              value={cvv}
              onChange={handleInputChange}
            />
          </div>
        </Collapse>

        {opened && !session?.user?.isGuest && !creditCardFormOpen ? (
          <Button color="ghost" size="sm" startIcon={plusIcon} onClick={toggleCreditCardForm}>
            Add credit card
          </Button>
        ) : undefined}

        <Collapse in={creditCardFormOpen}>
          <CreditCardForm
            cartTotalData={cartTotalData}
            onCancel={handleCancelCreate}
            onCreate={handleCreateCreditCard}
          />
        </Collapse>

        {session?.user?.isGuest && !creditCardFormOpen ? (
          <Button link className="!m-0" onClick={handleChangeCreditCard}>
            Change credit card
          </Button>
        ) : undefined}
        <Collapse in={showCreditCard}>
          <>
            <div className="grid items-center justify-center lg:grid-cols-2 lg:gap-4">
              <Input
                ref={refs.promoCodeRef}
                noSpacing
                error={errors?.payment?.promoCode}
                label="Promo code (limit one)"
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
              <SkyWallet
                cartTotalData={cartTotalData}
                skyWallet={skyWallet}
                skyWalletFetching={skyWalletFetching}
                skyWalletLoading={skyWalletLoading}
              />
            </div>
          </>
        </Collapse>
      </div>
    </div>
  )
})

Payment.displayName = 'Payment'
