import { clsx } from 'clsx'

interface PriceProps {
  className?: string
  onSalePrice?: number
  price: number
}

export const Price = ({ className, onSalePrice, price }: PriceProps) => {
  const onSale = !!onSalePrice && onSalePrice < price

  return (
    <span className={clsx('text-lg font-bold', onSale && 'text-primary-400', className)}>
      $
      {new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(price || 0)}
      {onSale && (
        <sup className="ml-1 font-medium text-neutral-500">
          <del>
            $
            {new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(onSalePrice)}
          </del>
        </sup>
      )}
    </span>
  )
}
