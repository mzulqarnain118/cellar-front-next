import { useMemo } from 'react'

import { Box, BoxProps, Portal, rem } from '@mantine/core'
import { useHeadroom, useMediaQuery } from '@mantine/hooks'
import { UseMediaQueryOptions } from '@mantine/hooks/lib/use-media-query/use-media-query'

import { Search } from '@/components/search'

import { Navigation } from './navigation'
import { Ticker } from './ticker'

const mediaQueryOptions: UseMediaQueryOptions = { getInitialValueInEffect: false }

export const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 64em)', true, mediaQueryOptions)
  const pinnedOptions = useMemo(() => ({ fixedAt: isDesktop ? 500 : 160 }), [isDesktop])
  const pinned = useHeadroom(pinnedOptions)

  const boxSx: BoxProps['sx'] = useMemo(
    () => ({
      left: 0,
      position: 'fixed',
      right: 0,
      top: 0,
      transform: `translate3d(0, ${pinned ? 0 : rem(isDesktop ? -126 : -160)}, 0)`,
      transition: 'transform 400ms ease',
    }),
    [isDesktop, pinned]
  )

  return (
    <Portal>
      <Box sx={boxSx}>
        <Ticker />
        <header>
          <div
            className={`
              relative top-0 left-0 z-20 w-full border-b border-solid border-neutral-200
              bg-neutral-50 text-neutral-900
            `}
          >
            <div className={pinned ? 'shadow-sm' : 'shadow-md'}>
              <Navigation />
              {isDesktop ? undefined : <Search className="container mx-auto" id="header-search" />}
            </div>
          </div>
        </header>
      </Box>
    </Portal>
  )
}
