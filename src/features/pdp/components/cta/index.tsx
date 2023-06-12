import { useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useProductQuery } from '@/lib/queries/products'

import { usePdpActions, usePdpSelectedProduct } from '../../store'
import { Variations } from '../variations'

import { CtaActions } from './actions'

const Options = dynamic(() => import('../options').then(({ Options }) => Options))

interface CTAProps {
  cartUrl: string
}

export const CTA = ({ cartUrl }: CTAProps) => {
  const { data: flightData } = useProductQuery(cartUrl)
  const selectedProduct = usePdpSelectedProduct()
  const { setSelectedProduct } = usePdpActions()

  useEffect(() => {
    if (selectedProduct === undefined) {
      setSelectedProduct(flightData || undefined)
    }
  }, [flightData, selectedProduct, setSelectedProduct])

  return (
    <div className="my-4 space-y-4 border-y border-neutral-light py-6" id="add-to-cart-section">
      {flightData?.subscriptionProduct !== undefined ? <Options cartUrl={cartUrl} /> : undefined}
      {flightData?.subscriptionProduct === undefined &&
      flightData?.variations !== undefined &&
      flightData?.variations.length > 0 ? (
        <Variations cartUrl={cartUrl} />
      ) : undefined}
      <CtaActions />
    </div>
  )
}
