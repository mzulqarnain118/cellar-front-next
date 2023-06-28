import { memo } from 'react'

import { CartItem, SubscriptionProduct } from '@/lib/types'
import { trackProductSelected } from '@/lib/utils/gtm-util'
import { BlurImage } from '../blur-image'
import { Link } from '../link'

interface ProductImageLinkProps {
  product: SubscriptionProduct | CartItem
  cartUrl: string
  displayName: string
  pictureUrl?: string
  priority?: boolean
}


export const ProductImageLink = memo(
  ({ product, cartUrl, displayName, pictureUrl, priority = false }: ProductImageLinkProps) => (
    <figure className="flex items-center self-center justify-self-center">
      {pictureUrl !== undefined ? (
        <Link className="relative w-60 h-60" onClick={() => trackProductSelected(product)} href={`/product/${cartUrl}`}>
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
