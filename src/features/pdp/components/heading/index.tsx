import { Skeleton } from '@mantine/core'

import { Price } from '@/components/price'
import { Typography } from '@/core/components/typogrpahy'
import { useProductQuery } from '@/lib/queries/products'

interface HeadingProps {
  cartUrl: string
}

export const Heading = ({ cartUrl }: HeadingProps) => {
  const { data: flightData, isError, isFetching, isLoading } = useProductQuery(cartUrl)

  if (isFetching || isLoading) {
    return (
      <>
        <Skeleton className="h-14 lg:h-9" />
        <Skeleton className="mt-1 h-6" />
        <Skeleton className="mt-4 h-9 w-1/3 lg:w-1/5" />
      </>
    )
  }

  if (isError) {
    // ! TODO: do something
  }

  if (!flightData) {
    return <></>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Typography as="h1" displayAs="h4">
          {flightData?.displayName}
        </Typography>
        <Typography as="p">
          {flightData?.attributes?.SubType} - {flightData?.attributes?.Varietal} -{' '}
          {flightData?.attributes?.['Container Size']}
        </Typography>
      </div>
      {flightData?.price !== undefined ? (
        <Price
          className="!text-3xl"
          price={flightData?.price}
          onSalePrice={flightData?.onSalePrice}
        />
      ) : undefined}
    </div>
  )
}
