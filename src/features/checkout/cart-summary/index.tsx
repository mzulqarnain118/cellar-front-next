import { formatCurrency } from '@/core/utils'
import { useGetSubtotalQuery } from '@/lib/queries/checkout/get-subtotal'

export const CartSummary = () => {
  const { data: subtotalInfo } = useGetSubtotalQuery()

  return (
    <>
      <p>{formatCurrency(subtotalInfo?.shipping.price || 0)}</p>
      <p>{formatCurrency(subtotalInfo?.tax || 0)}</p>
      <p>{formatCurrency(subtotalInfo?.orderTotal || 0)}</p>
    </>
  )
}
