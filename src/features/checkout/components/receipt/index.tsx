import { useMemo } from 'react'

import { Skeleton } from '@mantine/core'

import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useReceiptData } from '@/lib/stores/receipt'

export const Receipt = () => {
  const data = useReceiptData()
  const subtotal = data?.prices.subtotal || 0
  const shipping = data?.prices.shipping || 0
  const retailDeliveryFee = data?.prices.retailDeliveryFee || 0
  const salesTax = data?.prices.salesTax || 0
  const appliedSkyWallet = data?.prices.appliedSkyWallet || 0
  const discounts = useMemo(() => data?.discounts || [], [data.discounts])
  const subtotalAfterSavings = data?.prices.subtotalAfterSavings || subtotal
  const totalDiscount = useMemo(
    () => discounts.reduce((prev, current) => prev + current.amount, 0),
    [discounts]
  )
  const discount = discounts?.[0]?.amount ?? 0

  const total = subtotal + shipping + retailDeliveryFee + salesTax - discount

  if (!data) {
    return <Skeleton className="mt-12 h-[28.25rem] w-full max-w-2xl" />
  }

  return (
    <div className="mt-12 w-full max-w-2xl rounded border border-neutral-light bg-white py-10">
      <Typography as="h2" className="mb-4 text-center px-6" displayAs="h4">
        Your Order
      </Typography>
      <div className="px-6">
        <div className="flex items-center justify-between">
          <Typography>Subtotal</Typography>
          <Typography as="strong">{formatCurrency(data.prices.subtotal)}</Typography>
        </div>

        {!!data.discounts.length &&
          data.discounts.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <Typography className="basis-1/2">
                {item?.description ?? item?.TotalDescription}
              </Typography>
              <Typography as="strong" className="text-error">
                -{formatCurrency(item?.amount ?? item?.TotalAmount)}
              </Typography>
            </div>
          ))}
        <div className="flex items-center justify-between">
          <Typography>Shipping</Typography>
          <Typography as="strong">{`${formatCurrency(shipping)}`}</Typography>
        </div>
        {!!retailDeliveryFee && (
          <div className="flex items-center justify-between">
            <Typography>Retail Delivery Fee</Typography>
            <Typography as="strong">{`${formatCurrency(retailDeliveryFee)}`}</Typography>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Typography>Tax</Typography>
          <Typography as="strong">{`${formatCurrency(salesTax)}`}</Typography>
        </div>
      </div>
      <div className="mt-4 bg-[#e6e0dd] px-6 py-4">
        <div className="flex items-center justify-between py-2">
          <Typography>Total</Typography>
          <Typography as="strong">{`${formatCurrency(total)}`}</Typography>
        </div>
        {!!appliedSkyWallet && (
          <>
            <div className="flex items-center justify-between">
              <Typography>Sky Wallet</Typography>
              <Typography as="strong">{`-${formatCurrency(appliedSkyWallet)}`}</Typography>
            </div>
            <div className="flex items-center justify-between">
              <Typography>Total Due</Typography>
              <Typography as="strong">{`${formatCurrency(total - appliedSkyWallet)}`}</Typography>
            </div>
          </>
        )}
      </div>
      <div className="mt-12 grid grid-cols-12 gap-4 lg:gap-0 px-6">
        {data?.deliveryAddress.addressLineOne && (
          <div className="col-span-12 lg:col-span-6">
            <Typography as="h6">To be delivered to:</Typography>
            {!!data?.deliveryAddress.company && (
              <Typography as="p" className="text-14">
                {data?.deliveryAddress.company}
              </Typography>
            )}
            <Typography as="p" className="text-14">
              {`${data?.deliveryAddress.firstName || ''} ${data?.deliveryAddress.lastName || ''}`}
            </Typography>
            <Typography as="p" className="text-14">
              {`${data?.deliveryAddress.addressLineOne || ''}${
                data?.deliveryAddress.addressLineTwo
                  ? `, ${data?.deliveryAddress.addressLineTwo || ''}`
                  : ''
              }`}
            </Typography>
            <Typography as="p" className="text-14">
              {`${data?.deliveryAddress.city || ''}, ${data?.deliveryAddress.state || ''} ${
                data?.deliveryAddress.zipCode || ''
              }`}
            </Typography>
          </div>
        )}
        <div className="col-span-12 lg:col-span-6 lg:text-right">
          <Typography as="h6">Delivery Method</Typography>
          <Typography as="p" className="text-14">
            {data?.deliveryMethodDisplayName}
          </Typography>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 px-6">
        <Typography as="h6">OrderID</Typography>

        <Typography as="h6" className="text-right">
          {data?.orderDisplayId}
        </Typography>
      </div>
    </div>
  )
}
