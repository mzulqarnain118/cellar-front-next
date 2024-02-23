import { MouseEventHandler, memo } from 'react'

import { BlurImage } from '../blur-image'
import { Link } from '../link'

interface ProductImageLinkProps {
  cartUrl: string
  displayName: string
  pictureUrl?: string
  ctaLink?: string
  priority?: boolean
  onProductClick: MouseEventHandler<HTMLAnchorElement>
}

export const ProductImageLink = memo(
  ({
    cartUrl,
    displayName,
    pictureUrl,
    ctaLink,
    priority = false,
    onProductClick,
  }: ProductImageLinkProps) => (
    <figure className="flex items-center self-center justify-self-center">
      {pictureUrl !== undefined ? (
        <Link className="relative w-60 h-60" href={ctaLink ?? `/product/${cartUrl}`} onClick={onProductClick}>
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
