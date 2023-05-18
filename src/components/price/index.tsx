import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

interface PriceProps {
  className?: string
  onSalePrice?: number
  price: number
  subtext?: boolean
}

export const Price = ({ className, onSalePrice, price, subtext = true }: PriceProps) => {
  const onSale = !!onSalePrice && onSalePrice < price

  return (
    <div className="flex items-center gap-1">
      <Typography className={clsx('text-lg font-bold', onSale && 'text-brand', className)}>
        $
        {new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(onSale ? onSalePrice : price || 0)}
        {onSale ? (
          <sup className="ml-1 font-medium text-neutral-500">
            <del>
              $
              {new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(price)}
            </del>
          </sup>
        ) : undefined}
      </Typography>
      {subtext ? <Typography className="text-sm text-neutral-600">each</Typography> : undefined}
    </div>
  )
}
