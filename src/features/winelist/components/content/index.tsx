import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'

interface WinelistContentProps {
  displayName: string
  intro: string
  price: number
  sku: string
}

export const WinelistContent = ({ displayName, intro, price, sku }: WinelistContentProps) => {
  const orgPrice = formatCurrency(price * 1)
  const halfCasePrice = formatCurrency(price * 0.95)
  const fullCasePrice = formatCurrency(price * 0.9)

  return (
    <div className="grid grid-rows-[1fr_auto] p-4 divide-y divide-neutral-light">
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Typography>
          <strong>{displayName}</strong>
        </Typography>
        <div className="text-right">
          <Typography>
            <strong>{orgPrice}</strong> ea.
          </Typography>
          <Typography>
            1/2 case <strong>{halfCasePrice}</strong> ea.
          </Typography>
          <Typography>
            full case <strong>{fullCasePrice}</strong> ea.
          </Typography>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="grid">
          <Typography>SKU:</Typography>
          <strong>{sku}</strong>
        </div>
        <Typography>{intro}</Typography>
      </div>
    </div>
  )
}
