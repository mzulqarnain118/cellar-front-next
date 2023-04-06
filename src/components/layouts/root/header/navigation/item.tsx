import { ComponentPropsWithoutRef, forwardRef } from 'react'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Menu, NavLink, UnstyledButton } from '@mantine/core'
import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicLink, PrismicText } from '@prismicio/react'
import { LinkField, RichTextField } from '@prismicio/types'

interface TargetProps extends ComponentPropsWithoutRef<'button'> {
  linkField: LinkField | null | undefined
  textField: RichTextField | null | undefined
}

const Target = forwardRef<HTMLButtonElement, TargetProps>(
  ({ linkField, textField, ...rest }, ref) => (
    <UnstyledButton ref={ref} {...rest}>
      <div className="flex items-center gap-1">
        {!linkField || linkField.link_type === 'Any' ? (
          <PrismicText field={textField} />
        ) : (
          <PrismicLink field={linkField}>
            <PrismicText field={textField} />
          </PrismicLink>
        )}
        <ChevronDownIcon className="h-3 w-3 transition-transform group-hover:-rotate-180" />
      </div>
    </UnstyledButton>
  )
)

Target.displayName = 'Target'

interface NavigationItemProps {
  item: Content.NavigationMenuDocumentDataBodyNavigationLinkSlice
}

export const NavigationItem = ({ item }: NavigationItemProps) =>
  item.primary.link ? (
    <div className="group font-semibold">
      {item.items.length > 0 &&
      item.items.some(
        subNav => subNav.child_link.link_type !== 'Any' && 'url' in subNav.child_link
      ) ? (
        <Menu withArrow closeDelay={400} openDelay={100} shadow="md" trigger="hover">
          <Menu.Target>
            <Target linkField={item.primary.link} textField={item.primary.name} />
          </Menu.Target>
          <Menu.Dropdown>
            {item.items
              .map((subItem, index) => {
                if (subItem.child_link.link_type !== 'Any' && 'url' in subItem.child_link) {
                  return (
                    <Menu.Item
                      // ! TODO: Don't use index as key.
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${subItem.child_link.url}-${index}`}
                      className="font-normal"
                      component={PrismicLink}
                      field={subItem.child_link}
                    >
                      <PrismicText field={subItem.child_name} />
                    </Menu.Item>
                  )
                }
                return undefined
              })
              .filter(Boolean)}
          </Menu.Dropdown>
        </Menu>
      ) : (
        <NavLink
          component={PrismicLink}
          field={item.primary.link}
          label={asText(item.primary.name)}
        />
      )}
    </div>
  ) : (
    <></>
  )
