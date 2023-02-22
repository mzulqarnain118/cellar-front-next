import { useState } from 'react'

import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { Content } from '@prismicio/client'
import { PrismicLink, PrismicText } from '@prismicio/react'
import type { FilledContentRelationshipField } from '@prismicio/types'

import { isTruthyJSXElement } from '@/core/utils/predicates'

import { SubNavigationItem } from './sub-item'

interface NavigationItemProps {
  item: Content.NavigationMenuDocumentDataBodyNavigationLinkSlice
}

// ! TODO: Make this a helper.
const isValidNavigationItem = (
  item: unknown
): item is FilledContentRelationshipField<
  'navigation_item',
  string,
  Content.NavigationMenuDocumentData
> => typeof item === 'object' && !!item && 'id' in item

export const NavigationItem = ({ item }: NavigationItemProps) => {
  const [showSubNav, setShowSubNav] = useState(false)

  const subItems = item.items
    .map(navItem => {
      if (isValidNavigationItem(navItem.child_link)) {
        return <SubNavigationItem key={navItem.child_link.id} data={navItem} />
      }
    })
    .filter(isTruthyJSXElement)

  const link = !!item.primary.link && (
    <PrismicLink
      className="group flex h-12 items-center font-semibold"
      field={item.primary.link}
      onMouseEnter={() => setShowSubNav(true)}
    >
      <div className="grid">
        <PrismicText field={item.primary.name} />
        <span className="block h-0.5 max-w-0 bg-[#337250] transition-all group-hover:max-w-full" />
      </div>
    </PrismicLink>
  )

  // ! TODO: Responsive design.
  return (
    <div className="group" onMouseLeave={() => setShowSubNav(false)}>
      {link}
      {showSubNav && subItems.length > 0 && (
        <div className="absolute left-0 right-0 top-12 hidden min-h-[23.5rem] w-[1536px] rounded-b-lg bg-[#f0efed] text-neutral-900 shadow-lg group-hover:flex">
          <nav className="flex flex-col gap-2">
            <PrismicLink
              className="flex items-center gap-1 py-2 px-4 font-semibold transition-all hover:gap-2"
              field={item.primary.link}
            >
              All <PrismicText field={item.primary.name} />
              <ArrowRightIcon className="h-4 w-4 stroke-2" />
            </PrismicLink>
            <ul>{subItems}</ul>
          </nav>
        </div>
      )}
    </div>
  )
}
