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
    <figure className="relative w-64 h-64 flex items-center self-center justify-self-center">
      {pictureUrl !== undefined ? (
        <Link href={`/product/${cartUrl}`}>
          <BlurImage
            fill
            alt={displayName || 'Product'}
            className="object-contain"
            priority={priority}
            sizes="100vw"
            src={pictureUrl}
            // height={isDesktop ? 280 : 240}
            // width={isDesktop ? 200 : 200}
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
