import type { ElementType } from 'react'

import Link from 'next/link'

import type { LinkProps } from '@prismicio/react'

export const InternalLink: ElementType<LinkProps> = props => <Link {...props} />
