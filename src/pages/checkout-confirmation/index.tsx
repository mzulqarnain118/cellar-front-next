import { useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'
import Link from 'next/link'

import { NextPage } from 'next'
import { signOut, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'

import { BlurImage } from '@/components/blur-image'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { CHECKOUT_CONFIRMATION_PAGE_PATH } from '@/lib/paths'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useCheckoutActions } from '@/lib/stores/checkout'
import { useReceiptData } from '@/lib/stores/receipt'
import { trackCheckoutThanks } from '@/lib/utils/gtm-util'

const Receipt = dynamic(
  () => import('@/features/checkout/components/receipt').then(({ Receipt }) => Receipt),
  { ssr: false }
)

const CheckoutConfirmationPage: NextPage = () => {
  const { data: session } = useSession()
  const data = useReceiptData()
  const { data: consultant } = useConsultantQuery()
  const { reset } = useCheckoutActions()
  const subtotal = data?.prices.subtotal || 0
  const shipping = data?.prices.shipping || 0
  const retailDeliveryFee = data?.prices.retailDeliveryFee || 0
  const salesTax = data?.prices.salesTax || 0
  const discounts = useMemo(() => data?.discounts || [], [data.discounts])
  const totalDiscount = useMemo(
    () => discounts.reduce((prev, current) => prev + current.amount, 0),
    [discounts]
  )
  const total = subtotal + shipping + retailDeliveryFee + salesTax - totalDiscount

  const fullAddress = `${data?.deliveryAddress.firstName || ''} ${
    data?.deliveryAddress.lastName || ''
  } ${data?.deliveryAddress.addressLineOne || ''}${
    data?.deliveryAddress.addressLineTwo ? `, ${data?.deliveryAddress.addressLineTwo || ''}` : ''
  } ${data?.deliveryAddress.city || ''}, ${data?.deliveryAddress.state || ''} ${
    data?.deliveryAddress.zipCode || ''
  }`
  const products =
    data?.cartItems.map(item => ({
      category: item.categoryName,
      id: item.sku,
      name: item.displayName,
      price: item.price,
      quantity: item.quantity,
    })) || []

  const checkoutThanks = {
    PURL: consultant?.url,
    actionField: {
      affiliation: 'Direct Purchase',
      deliveryMethod: data?.deliveryMethodDisplayName,
      discount: `${formatCurrency(totalDiscount)}`,
      id: data.orderDisplayId, // Transaction ID. Required for purchases and refunds.
      orderDate: new Date(), //current date,
      revenue: `${formatCurrency(total)}`, // Total transaction value (incl. tax and shipping)
      shipToState: fullAddress,
      shipping: `${formatCurrency(shipping)}`,
      shippingMethod: 'checkoutThanksData?.shippingMethod',
      subTotal: `${formatCurrency(subtotal)}`,
      tax: `${formatCurrency(salesTax)}`,
    },
    cartState: data?.isSharedCart ? 'Shared' : 'Regular',
    consultantName: data?.consultantName,
    consultantReference: !!data?.consultantName,
    products: products,
    saleType: 'Direct Purchase',
  }

  useEffect(() => {
    trackCheckoutThanks(checkoutThanks)
  }, [])

  useEffect(() => {
    const signOutGuest = async () => {
      reset()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('checkout')
      }

      if (session?.user?.isGuest) {
        await signOut({ callbackUrl: CHECKOUT_CONFIRMATION_PAGE_PATH, redirect: false })
      }
    }
    signOutGuest()
  }, [reset, session?.user?.isGuest])

  return (
    <>
      <NextSeo nofollow noindex title="Order confirmation" />
      <main>
        <div className="bg-[#f5f4f2]">
          <div className="container mx-auto flex flex-col items-center justify-center pb-20">
            <div className="flex flex-col items-center justify-center space-y-4">
              <BlurImage alt="Enjoy" height={91} src="/enjoy.png" width={250} />
              <Typography as="h1" displayAs="h4">
                Your Clean-Crafted™ product is on the way
              </Typography>
              <Typography as="p" className="max-w-sm text-center text-14">
                Thank you for joining us on the journey to discover the unknown good. Your
                Clean-Crafted™ product is on its way. You can view your order confirmation below.
                Have questions or need some assistance? You can reach us at{' '}
                <Link href="email:hello@scoutandcellar.com">hello@scoutandcellar.com</Link>.
              </Typography>
            </div>
            <Receipt />
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutConfirmationPage
