import { useMemo } from 'react'

import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Content } from '@prismicio/client'
import { PrismicLink, PrismicText } from '@prismicio/react'
import type {
  EmptyLinkField,
  FilledContentRelationshipField,
  FilledLinkToMediaField,
  FilledLinkToWebField,
  RichTextField,
} from '@prismicio/types'

type CompleteNavigationItemLink = FilledContentRelationshipField<
  'navigation_menu',
  string,
  Content.NavigationMenuDocumentData
>

type Link =
  | CompleteNavigationItemLink
  | EmptyLinkField<'Any'>
  | FilledLinkToWebField
  | FilledLinkToMediaField

interface SubItemProps {
  data: {
    child_link: CompleteNavigationItemLink
    child_name: RichTextField
  }
  link?: Link
}

// Returns true if given link is not an empty navigation item link.
// ! TODO: Make this a helper.
const isCompleteNavigationItemLink = (
  childLink: EmptyLinkField<'Document'> | CompleteNavigationItemLink
): childLink is CompleteNavigationItemLink =>
  childLink.link_type === 'Document' && 'type' in childLink && childLink.type === 'navigation_menu'

export const SubNavigationItem = ({ data, link }: SubItemProps) => {
  console.log('data', data.child_link)
  const childLink = data.child_link

  const navigationItems = useMemo(() => {
    if (isCompleteNavigationItemLink(childLink)) {
      return childLink.data?.body?.filter(Boolean).map(item => {
        // * NOTE: Values should be truthy and not be empty objects.
        const items = item.items.filter(element => !!element && Object.keys(element).length !== 0)
        const hasSubNavLinks = items.filter(Boolean).length > 0
        const Element = hasSubNavLinks ? 'div' : PrismicLink

        return (
          <li key={item.id} className="flex cursor-pointer items-center justify-between py-3 px-4">
            <Element field={item.primary.link}>
              <PrismicText field={item.primary.name} />
              {hasSubNavLinks && <ChevronRightIcon className="h-4 w-4 stroke-2" />}
            </Element>
          </li>
        )
      })
    }
  }, [childLink])

  if (!isCompleteNavigationItemLink(childLink)) {
    return (
      <li>
        <PrismicLink
          className="flex cursor-pointer items-center justify-between py-3 px-4"
          field={childLink}
        />
      </li>
    )
  }

  return (
    <li>
      <PrismicLink
        className="flex cursor-pointer items-center justify-between py-3 px-4"
        field={childLink}
      >
        <PrismicText field={childLink.data?.name} />
        <ArrowRightIcon className="h-4 w-4 stroke-2" />
      </PrismicLink>
      {navigationItems !== undefined && (
        <nav>
          <ul>{navigationItems}</ul>
        </nav>
      )}
    </li>
  )
}
