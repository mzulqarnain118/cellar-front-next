import { useRef } from 'react'

import { useMediaQuery } from '@mantine/hooks'
import { UseMediaQueryOptions } from '@mantine/hooks/lib/use-media-query/use-media-query'
import { clsx } from 'clsx'

import { Search } from '@/components/search'
import { useScrollDirection } from '@/core/hooks/use-scroll-direction'

import { Navigation } from './navigation'
import { Ticker } from './ticker'

const mediaQueryOptions: UseMediaQueryOptions = { getInitialValueInEffect: false }

export const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 64em)', true, mediaQueryOptions)
  const ref = useRef<HTMLElement | null>(null)

  const { direction, scrollTop } = useScrollDirection()
  const headerHeight = ref?.current?.clientHeight || 0

  return (
    <>
      <Ticker />
      <header
        ref={ref}
        className={clsx(
          'sticky top-0 z-20 transition-all delay-150 duration-500',
          direction === 'down' && scrollTop > headerHeight ? '-translate-y-52' : 'translate-y-0'
        )}
      >
        <div className="relative top-0 left-0 z-20 w-full bg-neutral-50 text-neutral-900">
          <div className="shadow">
            <Navigation />
            {isDesktop ? undefined : <Search className="container mx-auto" id="header-search" />}
          </div>
        </div>
      </header>
    </>
  )
}
