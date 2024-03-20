import { Skeleton } from '@mantine/core'

import { Price } from '@/components/price'
import { Typography } from '@/core/components/typogrpahy'

import { usePdpSelectedOption, usePdpSelectedProduct } from '../../store'

export const Heading = () => {
  const selectedProduct = usePdpSelectedProduct()
  const selectedOption = usePdpSelectedOption()

  if (selectedProduct === undefined) {
    return (
      <>
        <Skeleton className="h-14 lg:h-9" />
        <Skeleton className="mt-1 h-6" />
        <Skeleton className="mt-4 h-9 w-1/3 lg:w-1/5" />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Typography as="h1" displayAs="h4">
          {selectedProduct.displayName}
        </Typography>
        <Typography as="p">
          {selectedProduct.attributes?.SubType} - {selectedProduct.attributes?.Varietal} -{' '}
          {selectedProduct.attributes?.['Container Size']}
        </Typography>
      </div>
      {selectedProduct.price !== undefined ? (
        <Price
          className="!text-3xl"
          selectedOption={selectedOption}
          price={selectedProduct.price}
          onSalePrice={selectedProduct.onSalePrice}
        />
      ) : undefined}
    </div>
  )
}
