import { forwardRef } from 'react'

import { SelectItemProps } from '@mantine/core'

import { Typography } from '@/core/components/typogrpahy'
import { ProductsSchema } from '@/lib/types/schemas/product'

type ItemProps = SelectItemProps & ProductsSchema

export const SearchItem = forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      attributes: _attributes,
      availability: _availability,
      badges: _badges,
      cartUrl: _cartUrl,
      catalogId: _catalogId,
      displayCategories: _displayCategories,
      displayCategoriesSortData: _displayCategoriesSortData,
      displayName,
      isAutoSip: _isAutoSip,
      isClubOnly: _isClubOnly,
      isGift: _isGift,
      isGiftCard: _isGiftCard,
      isScoutCircleClub: _isScoutCircleClub,
      isVip: _isVip,
      onSalePrice: _onSalePrice,
      pictureUrl: _pictureUrl,
      price: _price,
      quantityAvailable: _quantityAvailable,
      sku: _sku,
      subscribable: _subscribable,
      subscriptionProduct: _subscriptionProduct,
      variations: _variations,
      ...rest
    }: ItemProps,
    ref
  ) => (
    <div
      ref={ref}
      className="hover:bg-neutral-dark hover:text-neutral-50 hover:cursor-pointer"
      {...rest}
    >
      <Typography>{displayName.toLowerCase()}</Typography>
    </div>
  )
)

SearchItem.displayName = 'SearchItem'
