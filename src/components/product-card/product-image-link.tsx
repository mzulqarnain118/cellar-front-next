import { memo } from 'react'

import { BlurImage } from '../blur-image'
import { Link } from '../link'

const PRODUCT_IMAGE_DIMENSIONS = { height: 'auto', width: 'auto' }

interface ProductImageLinkProps {
  cartUrl: string
  displayName: string
  pictureUrl?: string
  priority?: boolean
}

export const ProductImageLink = memo(
  ({ cartUrl, displayName, pictureUrl, priority = false }: ProductImageLinkProps) => (
    <figure className="relative flex items-center self-center justify-self-center md:w-40">
      {pictureUrl !== undefined ? (
        <Link href={`/product/${cartUrl}`}>
          <BlurImage
            alt={displayName || 'Product'}
            className="object-contain"
            height={304}
            priority={priority}
            src={pictureUrl}
            style={PRODUCT_IMAGE_DIMENSIONS}
            width={192}
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
