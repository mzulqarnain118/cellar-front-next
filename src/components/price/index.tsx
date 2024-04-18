import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

interface PriceProps {
  className?: string
  onSalePrice?: number
  price: number
  subtext?: boolean
  selectedOption?: boolean
  product?: any
}

const findPrices = (num1: number, num2: number) => {
  // Find the lowest and highest numbers
  const lowest = Math.min(num1, num2)
  const highest = Math.max(num1, num2)

  // Construct the object
  const result = {
    Price: highest,
    onSalePrice: lowest,
  }

  return result
}

export const Price = ({ className, onSalePrice, price, subtext = true }: PriceProps) => {
  let prices

  if (onSalePrice) {
    prices = findPrices(Number(onSalePrice), Number(price))
  }

  const onSale = !!onSalePrice

  return (
    <div className="flex items-center gap-1">
      <Typography className={clsx('text-lg font-bold', onSale && 'text-brand', className)}>
        $
        {new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(onSale ? prices?.onSalePrice : price)}
        {onSale && onSalePrice !== price ? (
          <sup className="ml-1 font-medium text-neutral-500">
            <del>
              $
              {new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(prices?.Price)}
            </del>
          </sup>
        ) : undefined}
      </Typography>
      {subtext ? <Typography className="text-sm text-neutral-600">each</Typography> : undefined}
    </div>
  )
}
