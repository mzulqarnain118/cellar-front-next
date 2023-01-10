import { HTMLAttributes } from 'react'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import Link from 'next/link'

interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: {
    location: string
    name: string
  }[]
}

export const Breadcrumb = ({ items, ...rest }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="mb-8 flex" {...rest}>
    <ol className="flex items-center space-x-1">
      {items.map((item, index) => (
        <li
          key={item.location}
          aria-current={index === items.length - 1 && 'page'}
          className="flex items-center"
        >
          {index > 0 ? <ChevronRightIcon height={16} width={16} /> : undefined}
          <Link
            className={clsx(
              'text-sm text-neutral-400 hover:text-neutral-600 hover:underline',
              index === items.length - 1 ? 'font-bold' : 'font-medium'
            )}
            href={item.location}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ol>
  </nav>
)
