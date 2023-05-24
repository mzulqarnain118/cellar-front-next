import { useCallback } from 'react'

import { useRouter } from 'next/router'

import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { Divider } from 'react-daisyui'

import { BlurImage } from '@/components/blur-image'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { LOCAL_PICK_UP_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { MY_ACCOUNT_PAGE_PATH } from '@/lib/paths'

import type { Subscription as SubscriptionType } from '../../queries/subscriptions'

const getStatusName = (subscription: SubscriptionType) => {
  if (!subscription.Enabled) {
    return 'Cancelled'
  } else if (!subscription.NextProcessingDate) {
    return 'Paused'
  } else {
    return 'Active'
  }
}

const getNextOrderDate = (
  subscription: Pick<SubscriptionType, 'Enabled' | 'NextProcessingDate'>
) => {
  if (!subscription.Enabled) {
    return ''
  } else if (!subscription.NextProcessingDate) {
    return 'Paused'
  } else {
    return format(parseISO(subscription.NextProcessingDate), 'M/d/yyyy')
  }
}

interface SubscriptionProps {
  autoSip?: boolean
  data: SubscriptionType
}

export const Subscription = ({ autoSip = false, data }: SubscriptionProps) => {
  const router = useRouter()

  const handleEdit = useCallback(() => {
    router.push(
      `${MY_ACCOUNT_PAGE_PATH}/${autoSip ? 'auto-sips' : 'clubs'}/${data.SubscriptionID}/edit`
    )
  }, [autoSip, data.SubscriptionID, router])

  const handleOrderHistory = useCallback(() => {
    router.push(`${MY_ACCOUNT_PAGE_PATH}/orders`)
  }, [router])

  return (
    <div className="rounded">
      <div className="flex flex-wrap items-start justify-between gap-2 rounded-t bg-[#403839] p-6 text-14 text-neutral-50">
        <div className="grid">
          <Typography className="font-bold">Date created</Typography>
          <Typography>{format(parseISO(data.DateCreated), 'M/d/yyyy')}</Typography>
        </div>
        <div className="grid">
          <Typography className="font-bold">Status</Typography>
          <Typography>{getStatusName(data)}</Typography>
        </div>
        <div className="grid">
          <Typography className="font-bold">Payment method</Typography>
          <Typography>
            {data.PaymentType} ending in {data.PaymentDisplayNumber}
          </Typography>
        </div>
        <div className="grid">
          <Typography className="font-bold">Subscription type</Typography>
          <Typography>{autoSip ? 'Auto-Sip™' : 'Scout Circle Club'}</Typography>
        </div>
        <div className="grid">
          <Typography className="font-bold">Shipping method</Typography>
          <Typography>{data.ShippingMethodName}</Typography>
        </div>
      </div>
      <div className="border border-neutral-light p-6 lg:grid lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="relative mx-auto mb-4 h-[15.75rem] w-[18.75rem]">
          <BlurImage
            fill
            alt={data.ProductDisplayName}
            className="object-contain"
            src={data.ProductImageURL}
          />
        </div>
        <div>
          <Typography className="text-18 font-bold">{data.ProductDisplayName}</Typography>
          <Divider />
          <div className="grid grid-cols-3 grid-rows-2 items-start gap-x-2 text-14 lg:text-base">
            <div className="grid">
              <Typography className="font-bold">Price</Typography>
              <Typography>{formatCurrency(data.Price)}</Typography>
            </div>
            <div className="grid">
              <Typography className="font-bold">Quantity</Typography>
              <Typography>{data.Quantity}</Typography>
            </div>
            <div className="grid">
              <Typography className="font-bold">Frequency</Typography>
              <Typography>{data.Frequency}</Typography>
            </div>
            <div className="grid">
              <Typography className="font-bold">Next order date</Typography>
              <Typography>
                {getNextOrderDate({
                  Enabled: data.Enabled,
                  NextProcessingDate: data.NextProcessingDate,
                })}
              </Typography>
            </div>
            <div className="grid">
              <Typography className="font-bold">Subscription ID</Typography>
              <Typography>{data.SubscriptionID}</Typography>
            </div>
          </div>
          <Divider />
          <div className="grid rounded border border-neutral-light p-4 shadow-lg">
            <Typography as="h6" className="mb-2 border-b border-neutral-light pb-2">
              {data.ShippingMethodID === LOCAL_PICK_UP_SHIPPING_METHOD_ID ? 'Pick up' : 'Ship to'}
            </Typography>
            <Typography className="text-neutral-600">
              {data.Address?.FirstName} {data.Address?.LastName}
            </Typography>
            <Typography className="text-neutral-600">{data.Address?.Street1}</Typography>
            {data.Address?.Street2 ? (
              <Typography className="text-neutral-600">{data.Address?.Street2}</Typography>
            ) : undefined}
            <Typography className="text-neutral-600">
              {data.Address?.City}, {data.Address?.ProvinceName} {data.Address?.PostalCode}
            </Typography>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 lg:col-span-2 lg:flex-row lg:justify-end">
          <Button color="ghost" variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button dark onClick={handleOrderHistory}>
            Order history
          </Button>
        </div>
      </div>
    </div>
  )
}
