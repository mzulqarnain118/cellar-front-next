import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Collapse, HoverCard } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { Content } from '@prismicio/client'
import { asLink, asText } from '@prismicio/helpers'
import { PrismicLink } from '@prismicio/react'
import { clsx } from 'clsx'

interface NavigationItemProps {
  data: Content.NavigationMenuDocumentDataBodyNavigationLinkSlice
  isDesktop: boolean
  onLinkClick: () => void
}

const hoverCardClassNames = { dropdown: 'p-0 w-full items-center border-0' }

export const NavigationItem = ({ data, isDesktop = false, onLinkClick }: NavigationItemProps) => {
  const { pathname } = useRouter()
  const [opened, { toggle }] = useDisclosure(false)

  const handleClick = useCallback(() => {
    toggle()
    onLinkClick()
  }, [onLinkClick, toggle])

  const children = useMemo(
    () => (
      <div className="w-[calc(100svw-1rem)] border border-[#231f20] bg-[#231f20] text-[#f5f3f2]">
        <div
          className={`
            container mx-auto flex flex-col items-center gap-4 text-14 lg:flex-row
            lg:justify-between
          `}
        >
          {data.items.map(item => (
            <PrismicLink
              key={`${asText(item.child_name)}-${data.id}`}
              className={clsx(
                `inline-flex h-10 w-full items-center justify-center lg:justify-evenly lg:px-8
                lg:text-center lg:!text-14 lg:hover:bg-[#f5f3f2] lg:hover:text-[#231f20]`,
                pathname === asLink(item.child_link) && 'bg-[#f5f3f2] text-[#231f20]'
              )}
              field={item.child_link}
              onClick={handleClick}
            >
              {asText(item.child_name)}
            </PrismicLink>
          ))}
        </div>
      </div>
    ),
    [data.id, data.items, handleClick, pathname]
  )

  if (isDesktop) {
    return (
      <HoverCard classNames={hoverCardClassNames} closeDelay={300} shadow="md">
        <HoverCard.Target>
          <button
            className="inline-flex h-10 w-[stretch] items-center justify-center gap-2"
            onClick={toggle}
          >
            {asText(data.primary.name)}
            {opened ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </HoverCard.Target>
        <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
      </HoverCard>
    )
  }

  return (
    <div className="relative w-full">
      <button
        className="inline-flex h-10 w-[stretch] items-center justify-center gap-2"
        onClick={toggle}
      >
        {asText(data.primary.name)}
        {opened ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      <Collapse className="w-[stretch]" in={opened}>
        {children}
      </Collapse>
    </div>
  )
}
