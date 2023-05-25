import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import { Collapse, HoverCard, HoverCardProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { Content } from '@prismicio/client'
import { asLink, asText } from '@prismicio/helpers'
import { PrismicLink } from '@prismicio/react'
import { clsx } from 'clsx'

import { Link } from '@/components/link'

interface NavigationItemProps {
  data: Content.NavigationMenuDocumentDataBodyNavigationLinkSlice
  isDesktop: boolean
  onLinkClick: () => void
}

const hoverCardClassNames: HoverCardProps['classNames'] = {
  arrow: 'bg-[#231f20] -z-10',
  dropdown: '!p-0 !w-full items-center border-0',
}

export const NavigationItem = ({ data, isDesktop = false, onLinkClick }: NavigationItemProps) => {
  const { pathname } = useRouter()
  const [opened, { toggle }] = useDisclosure(false)

  const handleClick = useCallback(() => {
    toggle()
    onLinkClick()
  }, [onLinkClick, toggle])

  const children = useMemo(
    () => (
      <div className="border border-[#231f20] bg-[#231f20] p-1 text-[#f5f3f2]">
        <div
          className={`
            container mx-auto flex flex-col items-center gap-4 text-14 font-bold
            lg:flex-row lg:justify-center
          `}
        >
          {data.items.map(item => (
            <PrismicLink
              key={`${asText(item.child_name)}-${data.id}`}
              className={clsx(
                `inline-flex h-7 w-full items-center justify-center lg:justify-evenly lg:py-1
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
      <HoverCard
        withArrow
        withinPortal
        arrowSize={16}
        classNames={hoverCardClassNames}
        closeDelay={300}
        shadow="md"
      >
        <HoverCard.Target>
          <Link
            className={clsx(
              'mb-1 flex h-12 w-[stretch] items-start leading-[31px] transition-all duration-100 hover:border-b-4 hover:border-[#231f20]',
              data.primary.bold && 'font-bold'
            )}
            href={asLink(data.primary.link) || ''}
          >
            {asText(data.primary.name)}
          </Link>
        </HoverCard.Target>
        <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
      </HoverCard>
    )
  }

  return (
    <div className="relative w-full">
      <button
        className="inline-flex h-fit w-[stretch] items-center justify-center gap-2"
        onClick={toggle}
      >
        {asText(data.primary.name)}
      </button>
      <Collapse className="w-[stretch]" in={opened}>
        {children}
      </Collapse>
    </div>
  )
}
