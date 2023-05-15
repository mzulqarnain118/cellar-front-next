import { useMemo } from 'react'

import { Steps } from 'react-daisyui'

import { useCheckoutTabs } from '@/features/checkout/hooks/use-tabs'

interface StepData {
  color?:
    | 'success'
    | 'primary'
    | 'neutral'
    | 'secondary'
    | 'accent'
    | 'ghost'
    | 'info'
    | 'warning'
    | 'error'
  value?: string
}

export const CheckoutSteps = () => {
  const {
    isContactInformationActive,
    isContactInformationCompleted,
    isDeliveryActive,
    isDeliveryCompleted,
    isPaymentActive,
    isPaymentCompleted,
  } = useCheckoutTabs()

  const contactInformation: StepData = useMemo(() => {
    if (isContactInformationCompleted) {
      return { color: 'success', value: '✓' }
    }

    return {
      color: isContactInformationActive ? 'warning' : undefined,
      value: isContactInformationActive ? '?' : undefined,
    }
  }, [isContactInformationActive, isContactInformationCompleted])

  const delivery: StepData = useMemo(() => {
    if (isDeliveryCompleted) {
      return { color: 'success', value: '✓' }
    }

    return {
      color: isDeliveryActive ? 'warning' : undefined,
      value: isDeliveryActive ? '?' : undefined,
    }
  }, [isDeliveryActive, isDeliveryCompleted])

  const payment: StepData = useMemo(() => {
    if (isPaymentCompleted) {
      return { color: 'success', value: '✓' }
    }

    return {
      color: isPaymentActive ? 'warning' : undefined,
      value: isPaymentActive ? '?' : undefined,
    }
  }, [isPaymentActive, isPaymentCompleted])

  return (
    <div className="container mx-auto mt-4 lg:m-0 lg:w-auto">
      <Steps>
        <Steps.Step
          className="text-14"
          color={contactInformation.color}
          value={contactInformation.value}
        >
          Contact information
        </Steps.Step>
        <Steps.Step className="text-14" color={delivery.color} value={delivery.value}>
          Delivery
        </Steps.Step>
        <Steps.Step className="text-14" color={payment.color} value={payment.value}>
          Payment
        </Steps.Step>
      </Steps>
    </div>
  )
}
