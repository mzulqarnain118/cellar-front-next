import { useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

import {
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutCvv,
  useCheckoutGuestAddress,
  useCheckoutIsAddingAddress,
  useCheckoutIsAddingCreditCard,
  useCheckoutIsAddingGiftMessage,
  useCheckoutIsPickUp,
  useCheckoutSelectedPickUpAddress,
  useCheckoutSelectedPickUpOption,
} from '@/lib/stores/checkout'

type CheckoutTab = 'contact-information' | 'delivery' | 'payment'

export const useCheckoutTabs = () => {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<CheckoutTab>('contact-information')
  const [completedTabs, setCompletedTabs] = useState<CheckoutTab[]>([])
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const cvv = useCheckoutCvv()
  const guestAddress = useCheckoutGuestAddress()
  const isAddingAddress = useCheckoutIsAddingAddress()
  const isAddingCreditCard = useCheckoutIsAddingCreditCard()
  const isAddingGiftMessage = useCheckoutIsAddingGiftMessage()
  const isPickUp = useCheckoutIsPickUp()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()
  const selectedPickUpOption = useCheckoutSelectedPickUpOption()

  useEffect(() => {
    if (activeCreditCard === undefined || isAddingCreditCard || !cvv.length) {
      setActiveTab('payment')
      setCompletedTabs(prev => prev.filter(tab => tab !== 'payment'))
    } else {
      setCompletedTabs(prev => [...prev, 'payment'])
    }

    if (
      activeShippingAddress === undefined ||
      isAddingAddress ||
      (isPickUp && selectedPickUpOption === undefined) ||
      (isPickUp &&
        selectedPickUpOption !== undefined &&
        selectedPickUpOption !== 'lpu' &&
        selectedPickUpAddress === undefined)
    ) {
      setActiveTab('delivery')
      setCompletedTabs(prev => prev.filter(tab => tab !== 'delivery'))
    } else {
      setCompletedTabs(prev => [...prev, 'delivery'])
    }

    if (session?.user?.isGuest && guestAddress !== undefined) {
      setCompletedTabs(prev => [...prev, 'delivery'])
    }

    if (session?.user === undefined || isAddingGiftMessage) {
      setActiveTab('contact-information')
      setCompletedTabs(prev => prev.filter(tab => tab !== 'contact-information'))
    } else {
      setCompletedTabs(prev => [...prev, 'contact-information'])
    }
  }, [
    activeCreditCard,
    activeShippingAddress,
    cvv.length,
    guestAddress,
    isAddingAddress,
    isAddingCreditCard,
    isAddingGiftMessage,
    isPickUp,
    selectedPickUpAddress,
    selectedPickUpOption,
    session?.user,
  ])

  const isContactInformationCompleted = completedTabs.includes('contact-information')
  const isDeliveryCompleted = completedTabs.includes('delivery')
  const isPaymentCompleted = completedTabs.includes('payment')

  return useMemo(
    () => ({
      isContactInformationActive:
        activeTab === 'contact-information' || isContactInformationCompleted,
      isContactInformationCompleted,
      isDeliveryActive: activeTab === 'delivery' || isDeliveryCompleted,
      isDeliveryCompleted,
      isPaymentActive: activeTab === 'payment' || isPaymentCompleted,
      isPaymentCompleted,
    }),
    [activeTab, isContactInformationCompleted, isDeliveryCompleted, isPaymentCompleted]
  )
}
