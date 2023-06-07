import { useCallback, useEffect, useMemo, useRef } from 'react'

import dynamic from 'next/dynamic'

import { useDisclosure, useReducedMotion, useScrollIntoView, useWindowScroll } from '@mantine/hooks'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'
import { Badge } from 'react-daisyui'

import { Link } from '@/components/link'
import { Typography } from '@/core/components/typogrpahy'
import { wait } from '@/core/utils/time'
import { CartSummary } from '@/features/checkout/components/cart-summary'
import { ContactInformation } from '@/features/checkout/components/contact-information'
import { Delivery } from '@/features/checkout/components/delivery'
import { Payment } from '@/features/checkout/components/payment'
import { useSetCartOwnerMutation } from '@/lib/mutations/cart/set-owner'
import { SIGN_IN_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutGiftCardCode,
  useCheckoutGiftMessage,
  useCheckoutIsAddingAddress,
  useCheckoutIsAddingCreditCard,
  useCheckoutIsAddingGiftMessage,
  useCheckoutIsPickUp,
  useCheckoutPromoCode,
  useCheckoutSelectedPickUpAddress,
  useCheckoutSelectedPickUpOption,
} from '@/lib/stores/checkout'

import { authOptions } from '../api/auth/[...nextauth]'

const PayForOrder = dynamic(
  () =>
    import('@/features/checkout/components/pay-for-order').then(({ PayForOrder }) => PayForOrder),
  { ssr: false }
)

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: SIGN_IN_PAGE_PATH,
        permanent: false,
      },
    }
  }

  return {
    props: {
      session: null,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const scrollIntoViewSettings = { duration: 500, offset: 120 }

const CheckoutPage: NextPage<PageProps> = () => {
  const { mutate: setCartOwner } = useSetCartOwnerMutation()
  const { data: cart } = useCartQuery()
  const [scroll] = useWindowScroll()
  const prefersReducedMotion = useReducedMotion()

  const activeCreditCard = useCheckoutActiveCreditCard()
  const isAddingAddress = useCheckoutIsAddingAddress()
  const isAddingCreditCard = useCheckoutIsAddingCreditCard()
  const isAddingGiftMessage = useCheckoutIsAddingGiftMessage()
  const isPickUp = useCheckoutIsPickUp()
  const giftMessage = useCheckoutGiftMessage()
  const giftCardCodes = useCheckoutGiftCardCode()
  const promoCodes = useCheckoutPromoCode()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()
  const selectedPickUpOption = useCheckoutSelectedPickUpOption()
  const { setErrors } = useCheckoutActions()

  const [
    contactInformationOpened,
    { open: openContactInformation, toggle: toggleContactInformation },
  ] = useDisclosure(true)
  const isGiftRef = useRef<HTMLInputElement | null>(null)
  const { targetRef: giftMessageRef, scrollIntoView: scrollGiftMessageIntoView } =
    useScrollIntoView<HTMLTextAreaElement>(scrollIntoViewSettings)
  const { targetRef: recipientEmailRef, scrollIntoView: scrollRecipientEmailIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)

  const [deliveryOpened, { open: openDelivery, toggle: toggleDelivery }] = useDisclosure(true)
  const { targetRef: abcRef, scrollIntoView: scrollAbcIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: halRef, scrollIntoView: _scrollHalIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: shippingAddressRef, scrollIntoView: scrollShippingAddressIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const shippingMethodRef = useRef<HTMLInputElement | null>(null)

  const [paymentOpened, { open: openPayment, toggle: togglePayment }] = useDisclosure(true)
  const { targetRef: creditCardRef, scrollIntoView: scrollCreditCardIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: cvvRef, scrollIntoView: scrollCvvIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: giftCardRef, scrollIntoView: scrollGiftCardIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: promoCodeRef, scrollIntoView: scrollPromoCodeIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)

  const { targetRef: autoSipRef, scrollIntoView: scrollAutoSipIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: termsRef, scrollIntoView: scrollTermsIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)
  const { targetRef: wineClubRef, scrollIntoView: scrollWineClubIntoView } =
    useScrollIntoView<HTMLInputElement>(scrollIntoViewSettings)

  const contactInformationRefs = useMemo(
    () => ({ giftMessageRef, isGiftRef, recipientEmailRef }),
    [giftMessageRef, recipientEmailRef]
  )

  const deliveryRefs = useMemo(
    () => ({ abcRef, halRef, shippingAddressRef, shippingMethodRef }),
    [abcRef, halRef, shippingAddressRef]
  )

  const paymentRefs = useMemo(
    () => ({ creditCardRef, cvvRef, giftCardRef, promoCodeRef }),
    [creditCardRef, cvvRef, giftCardRef, promoCodeRef]
  )

  const payForOrderRefs = useMemo(
    () => ({ autoSipRef, termsRef, wineClubRef }),
    [autoSipRef, termsRef, wineClubRef]
  )

  const quantity = useMemo(
    () => cart?.items.reduce((prev, item) => item.quantity + prev, 0) || 0,
    [cart?.items]
  )

  const validate = useCallback(async () => {
    if (isAddingGiftMessage) {
      if (!recipientEmailRef.current?.value.length) {
        openContactInformation()
        await wait(300)

        if (!prefersReducedMotion) {
          scrollRecipientEmailIntoView()
        }
      } else if (!giftMessageRef.current?.value.length) {
        openContactInformation()
        await wait(300)

        if (!prefersReducedMotion) {
          scrollGiftMessageIntoView()
        }
      } else if (!giftMessage.message.length || !!giftMessage.recipientEmail.length) {
        openContactInformation()
        await wait(300)
        if (!prefersReducedMotion) {
          scrollGiftMessageIntoView()
        }
      }
      setErrors({ contactInformation: "Don't forget to save your gift message." })
      return false
    }

    if (isAddingAddress) {
      openDelivery()
      await wait(300)

      if (!prefersReducedMotion) {
        scrollShippingAddressIntoView()
      }
      setErrors({ delivery: "Don't forget to save your address." })
      return false
    }

    if (isPickUp && selectedPickUpOption === undefined) {
      openDelivery()
      await wait(300)

      if (!prefersReducedMotion) {
        scrollAbcIntoView()
      }
      setErrors({ delivery: 'Please select one.' })
      return false
    } else if (
      isPickUp &&
      selectedPickUpOption !== undefined &&
      selectedPickUpOption !== 'lpu' &&
      selectedPickUpAddress === undefined
    ) {
      openDelivery()
      if (!prefersReducedMotion) {
        scrollAbcIntoView()
      }
      setErrors({ delivery: 'Please select a pick up address.' })
      return false
    }

    if (isAddingCreditCard) {
      openPayment()
      await wait(300)

      if (!prefersReducedMotion) {
        scrollCreditCardIntoView()
      }
      setErrors(prev => ({
        ...prev,
        payment: { ...prev?.payment, form: "Don't forget to save your credit card." },
      }))
      return false
    }

    if (activeCreditCard !== undefined && !cvvRef.current?.value.length) {
      openPayment()
      await wait(300)

      if (!prefersReducedMotion) {
        scrollCvvIntoView()
      }
      setErrors(prev => ({
        ...prev,
        payment: { ...prev?.payment, cvv: 'Please enter the CVV for the card selected.' },
      }))
      cvvRef.current?.focus()
      return false
    }

    if (!promoCodes.isAdded && promoCodeRef.current?.value.length) {
      setErrors(prev => ({
        ...prev,
        payment: { ...prev?.payment, promoCode: "Don't forget to apply your promo code." },
      }))

      if (!prefersReducedMotion) {
        scrollPromoCodeIntoView()
      }

      promoCodeRef.current?.focus()
      return false
    }

    if (!giftCardCodes.isAdded && giftCardRef.current?.value.length) {
      setErrors(prev => ({
        ...prev,
        payment: { ...prev?.payment, giftCardCode: "Don't forget to apply your gift card code." },
      }))

      if (!prefersReducedMotion) {
        scrollGiftCardIntoView()
      }

      giftCardRef.current?.focus()
      return false
    }

    if (!termsRef.current?.checked) {
      if (!prefersReducedMotion) {
        scrollTermsIntoView()
      }
      setErrors({ terms: 'You must accept the Terms of Use.' })
      termsRef.current?.focus()
      return false
    }

    if (cart?.items.some(item => item.isAutoSip) && !autoSipRef.current?.checked) {
      if (!prefersReducedMotion) {
        scrollAutoSipIntoView()
      }
      setErrors({ autoSipTerms: 'You must accept the Auto-Sip™ Terms & Conditions.' })
      autoSipRef.current?.focus()
      return false
    }

    if (cart?.items.some(item => item.isScoutCircleClub) && !autoSipRef.current?.checked) {
      if (!prefersReducedMotion) {
        scrollWineClubIntoView()
      }
      setErrors({ wineClubTerms: 'You must accept the Wine Club Terms & Conditions.' })
      wineClubRef.current?.focus()
      return false
    }

    return true
  }, [
    activeCreditCard,
    autoSipRef,
    cart?.items,
    cvvRef,
    giftCardCodes.isAdded,
    giftCardRef,
    giftMessage.message.length,
    giftMessage.recipientEmail.length,
    giftMessageRef,
    isAddingAddress,
    isAddingCreditCard,
    isAddingGiftMessage,
    isPickUp,
    openContactInformation,
    openDelivery,
    openPayment,
    prefersReducedMotion,
    promoCodeRef,
    promoCodes.isAdded,
    recipientEmailRef,
    scrollAbcIntoView,
    scrollAutoSipIntoView,
    scrollCreditCardIntoView,
    scrollCvvIntoView,
    scrollGiftCardIntoView,
    scrollGiftMessageIntoView,
    scrollPromoCodeIntoView,
    scrollRecipientEmailIntoView,
    scrollShippingAddressIntoView,
    scrollTermsIntoView,
    scrollWineClubIntoView,
    selectedPickUpAddress,
    selectedPickUpOption,
    setErrors,
    termsRef,
    wineClubRef,
  ])

  useEffect(() => {
    if (cart !== undefined) {
      setCartOwner()
    }
  }, [cart, setCartOwner])

  return (
    <>
      <NextSeo title="Checkout" />
      <main>
        <div className="mt-8 flex h-full flex-col-reverse rounded lg:flex-row">
          <div className="h-full flex-1 space-y-6 rounded">
            <ContactInformation
              opened={contactInformationOpened}
              refs={contactInformationRefs}
              toggle={toggleContactInformation}
            />
            <Delivery opened={deliveryOpened} refs={deliveryRefs} toggle={toggleDelivery} />
            <Payment opened={paymentOpened} refs={paymentRefs} toggle={togglePayment} />
            <PayForOrder refs={payForOrderRefs} validate={validate} />
          </div>
          <div className="flex-1">
            <div
              className={`
              m-auto max-w-[28.5rem] rounded border border-base-dark bg-neutral-50 p-4 lg:relative
              lg:shadow-xl lg:transition-[top] lg:duration-500
            `}
              style={{ top: scroll.y }}
            >
              <div className="flex items-center justify-between">
                <Typography
                  noSpacing
                  as="h2"
                  className="!font-body !text-lg !font-bold lg:!text-3xl"
                  displayAs="h4"
                >
                  Your cart
                </Typography>
                <Badge className="text-lg" color="info" size="lg">
                  {quantity}
                </Badge>
              </div>
              <CartSummary />
              <div className="text-center pt-2">
                <Link href={WINE_PAGE_PATH}>Continue shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutPage
