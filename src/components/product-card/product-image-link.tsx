import { memo } from 'react'

import { useIsDesktop } from '@/core/hooks/use-is-desktop'

import { BlurImage } from '../blur-image'
import { Link } from '../link'

interface ProductImageLinkProps {
  cartUrl: string
  displayName: string
  pictureUrl?: string
  priority?: boolean
}

export const ProductImageLink = memo(
  ({ cartUrl, displayName, pictureUrl, priority = false }: ProductImageLinkProps) => {
    const isDesktop = useIsDesktop()

    return (
      <figure className="relative flex items-center self-center justify-self-center">
        {pictureUrl !== undefined ? (
          <Link href={`/product/${cartUrl}`}>
            <BlurImage
              alt={displayName || 'Product'}
              className="object-contain"
              height={isDesktop ? 280 : 240}
              priority={priority}
              src={pictureUrl}
              width={isDesktop ? 200 : 200}
            />
          </Link>
        ) : (
          // ! TODO: No image available.
          <></>
        )}
      </figure>
    )
  }
)

ProductImageLink.displayName = 'ProductImageLink'
