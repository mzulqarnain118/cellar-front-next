import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import format from 'date-fns/format'

import { BlurImage } from '@/components/blur-image'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { LOCAL_PICK_UP_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { MY_ACCOUNT_PAGE_PATH } from '@/lib/paths'
import { toastInfo } from '@/lib/utils/notifications'

import { CustomerOrder } from '../../queries/customer-orders'
import { useOrderTrackingQuery } from '../../queries/order-tracking'

interface OrderProps {
  data: CustomerOrder
}

const NON_CANCELABLE_ORDER_STATUSES = [3, 4, 5, 6]

export const Order = ({ data }: OrderProps) => {
  console.log('🚀 ~ Order ~ data:', data)
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)
  const { data: tracking, isFetching, isLoading } = useOrderTrackingQuery(data.DisplayID, enabled)
  const disableTrackButton = (isFetching || isLoading) && enabled

  const handleTrackPackage = useCallback(() => {
    setEnabled(true)
  }, [])

  const handleViewInvoice = useCallback(() => {
    router.push(`${MY_ACCOUNT_PAGE_PATH}/orders/${data.DisplayID}/invoice`)
  }, [data.DisplayID, router])

  const products = useMemo(
    () =>
      data?.OrderLines?.map(product => (
        <div key={product?.SKU} className="grid grid-cols-2 py-4 lg:grid-cols-[auto_1fr] lg:gap-4">
          <div className="relative h-44 w-28">
            {product?.ProductImageURL && (
              <BlurImage
                fill
                alt={product?.SKU}
                className="object-contain"
                src={product?.ProductImageURL}
              />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <Typography as="h6" className="mb-1">
                {product?.DisplayName}
              </Typography>
              <Typography className="rounded bg-primary p-1 text-sm text-neutral-50">
                {product?.SKU?.toLowerCase()}
              </Typography>
            </div>
            <div>
              <Typography as="h6">Order price</Typography>
              <Typography>
                {formatCurrency(product?.LinePrice)} x {product?.Quantity} ={' '}
                {formatCurrency(product?.LinePrice * product?.Quantity)}
              </Typography>
            </div>
          </div>
        </div>
      )),
    [data?.OrderLines]
  )

  useEffect(() => {
    if (enabled && !(isFetching || isLoading)) {
      if (tracking?.TrackingUrl) {
        router.push(tracking.TrackingUrl)
      } else {
        toastInfo({ message: 'There is no tracking data for this order.' })
      }
    }
  }, [enabled, isFetching, isLoading, router, tracking?.TrackingUrl])

  return (
    <div className="border border-neutral-light">
      <div className="grid grid-cols-2 items-center gap-4 bg-[#403839] p-5 text-neutral-50 lg:grid-cols-1 lg:gap-0">
        <Typography as="h6">Order #{data.DisplayID}</Typography>
        <div className="space-y-8 lg:grid lg:grid-cols-5 lg:items-end">
          <div className="grid">
            <Typography className="font-bold">Order placed</Typography>
            <Typography>
              {format(new Date(parseInt(data.OrderDate)), 'M/d/yyyy h:mm aaa')}
            </Typography>
          </div>
          <div className="grid">
            <Typography className="font-bold">Order total</Typography>
            <Typography>{formatCurrency(data.OrderTotal)}</Typography>
          </div>
          <div className="grid">
            <Typography className="font-bold">Order status</Typography>
            <Typography>{data.OrderStatusName}</Typography>
          </div>
          <div className="grid">
            <Typography className="font-bold">Payment status</Typography>
            <Typography>{data.OrderPaymentStatusName}</Typography>
          </div>
          <div className="grid">
            <Typography className="font-bold">Payment method</Typography>
            <Typography>{data.PaymentMethod}</Typography>
          </div>
        </div>
      </div>
      <div className="lg: justify-between p-5 lg:flex lg:items-center">
        <div className="divide-y divide-neutral-light">{products}</div>
        <div className="grid rounded border border-neutral-light p-4 shadow-lg">
          <Typography as="h6" className="mb-2 border-b border-neutral-light pb-2">
            {data.ShippingMethodID === LOCAL_PICK_UP_SHIPPING_METHOD_ID ? 'Pick up' : 'Ship to'}
          </Typography>
          <Typography className="text-neutral-600">{data.OrderAddress.Street1}</Typography>
          {data.OrderAddress.Street2 ? (
            <Typography className="text-neutral-600">{data.OrderAddress.Street2}</Typography>
          ) : undefined}
          <Typography className="text-neutral-600">
            {data.OrderAddress.City}, {data.OrderAddress.ProvinceName}{' '}
            {data.OrderAddress.PostalCode}
          </Typography>
        </div>
      </div>
      <div className="mt-4 grid gap-2 px-5 pb-5 lg:flex lg:justify-end">
        <Button
          color="error"
          disabled={NON_CANCELABLE_ORDER_STATUSES.includes(data.OrderStatusID)}
          title={
            NON_CANCELABLE_ORDER_STATUSES.includes(data.OrderStatusID)
              ? 'You are not able to cancel this order anymore.'
              : 'Cancel this order.'
          }
          variant="outline"
        >
          Cancel order
        </Button>
        <Button
          color="info"
          disabled={disableTrackButton}
          loading={disableTrackButton}
          onClick={handleTrackPackage}
        >
          Track package
        </Button>
        <Button dark onClick={handleViewInvoice}>
          View invoice
        </Button>
      </div>
    </div>
  )
}
