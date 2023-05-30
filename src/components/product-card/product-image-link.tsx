import { memo } from 'react'

import { BlurImage } from '../blur-image'
import { Link } from '../link'

interface ProductImageLinkProps {
  cartUrl: string
  displayName: string
  pictureUrl?: string
  priority?: boolean
}

export const ProductImageLink = memo(
  ({ cartUrl, displayName, pictureUrl, priority = false }: ProductImageLinkProps) => (
    <figure className="flex items-center self-center justify-self-center">
      {pictureUrl !== undefined ? (
        <Link className="relative w-64 h-64" href={`/product/${cartUrl}`}>
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
