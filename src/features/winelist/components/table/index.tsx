import { useMemo } from 'react'

import { Typography } from '@/core/components/typogrpahy'
import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
import { useProductsQuery } from '@/lib/queries/products'

import { WinelistContent } from '../content'

export const WinelistTable = () => {
  const { data: products } = useProductsQuery()

  const sparklings = useMemo(
    () =>
      products?.filter(product => product.displayCategories.includes(DISPLAY_CATEGORY.Sparkling)),
    [products]
  )

  const whiteWines = useMemo(
    () => products?.filter(product => product.displayCategories.includes(DISPLAY_CATEGORY.White)),
    [products]
  )

  const redWines = useMemo(
    () => products?.filter(product => product.displayCategories.includes(DISPLAY_CATEGORY.Red)),
    [products]
  )

  const roseWines = useMemo(
    () => products?.filter(product => product.displayCategories.includes(DISPLAY_CATEGORY.Rosé)),
    [products]
  )

  const wineClubs = useMemo(
    () =>
      products?.filter(product =>
        product.displayCategories.includes(DISPLAY_CATEGORY['Wine Clubs'])
      ),
    [products]
  )

  return (
    <div className="grid grid-cols-4">
      <div className="border border-neutral-dark">
        <Typography className="text-center font-bold bg-[#cfc4b0] py-4 block">Sparkling</Typography>
        <div className="divide-y divide-neutral-dark border-b border-neutral-dark">
          {sparklings?.map(wine => (
            <WinelistContent
              key={wine.sku}
              displayName={wine.displayName}
              intro=""
              price={wine.price}
              sku={wine.sku}
            />
          ))}
          <Typography className="text-center font-bold bg-[#cfc4b0] py-4 block">Rosé</Typography>
          <div className="divide-y divide-neutral-dark">
            {roseWines?.map(wine => (
              <WinelistContent
                key={wine.sku}
                displayName={wine.displayName}
                intro=""
                price={wine.price}
                sku={wine.sku}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border border-neutral-dark">
        <Typography className="text-center font-bold bg-[#cfc4b0] py-4 block">White</Typography>
        <div className="divide-y divide-neutral-dark border-b border-neutral-dark">
          {whiteWines?.map(wine => (
            <WinelistContent
              key={wine.sku}
              displayName={wine.displayName}
              intro=""
              price={wine.price}
              sku={wine.sku}
            />
          ))}
        </div>
      </div>
      <div className="col-span-2 border border-neutral-dark">
        <Typography className="text-center font-bold bg-[#cfc4b0] py-4 block">Red</Typography>
        <div className="grid divide-x divide-neutral-dark grid-cols-2">
          <div className="divide-y divide-neutral-dark border-b border-neutral-dark">
            {redWines?.slice(0, 17).map(wine => (
              <WinelistContent
                key={wine.sku}
                displayName={wine.displayName}
                intro=""
                price={wine.price}
                sku={wine.sku}
              />
            ))}
            <Typography className="text-center font-bold bg-[#cfc4b0] py-4 block">
              Wine Club
            </Typography>
            <div className="divide-y divide-neutral-dark border-b border-neutral-dark">
              {wineClubs?.map(wine => (
                <WinelistContent
                  key={wine.sku}
                  displayName={wine.displayName}
                  intro=""
                  price={wine.price}
                  sku={wine.sku}
                />
              ))}
            </div>
          </div>
          <div className="divide-y divide-neutral-dark border-b border-neutral-dark">
            {redWines?.slice(17).map(wine => (
              <WinelistContent
                key={wine.sku}
                displayName={wine.displayName}
                intro=""
                price={wine.price}
                sku={wine.sku}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
