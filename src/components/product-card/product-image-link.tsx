import { MouseEventHandler, memo } from 'react'

import { CartItem, SubscriptionProduct } from '@/lib/types'

import { BlurImage } from '../blur-image'
import { Link } from '../link'

interface ProductImageLinkProps {
  product: SubscriptionProduct | CartItem
  cartUrl: string
  displayName: string
  pictureUrl?: string
  priority?: boolean
  onProductClick: MouseEventHandler<HTMLAnchorElement>
}

export const ProductImageLink = memo(
  ({
    cartUrl,
    displayName,
    pictureUrl,
    priority = false,
    onProductClick,
  }: ProductImageLinkProps) => (
    <figure className="flex items-center self-center justify-self-center">
      {pictureUrl !== undefined ? (
        <Link className="relative w-60 h-60" href={`/product/${cartUrl}`} onClick={onProductClick}>
          <BlurImage
            fill
            alt={displayName || 'Product'}
            className="object-contain"
            priority={priority}
            sizes="(max-width: 992px) 80vw, (max-width: 1400px): 100vw"
            src={pictureUrl}
          />
        </Link>
      ) : (
        // ! TODO: No image available.
        <></>
      )}
    </figure>
  )
)

ProductImageLink.displayName = 'ProductImageLink'
