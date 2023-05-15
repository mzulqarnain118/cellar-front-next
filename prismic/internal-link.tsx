import { ComponentType, forwardRef } from 'react'

import type { LinkProps } from '@prismicio/react'
import dynamic from 'next/dynamic'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

export const InternalLink: ComponentType<LinkProps> = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} {...props} />
)

InternalLink.displayName = 'InternalLink'
