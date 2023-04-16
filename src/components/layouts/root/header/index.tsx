import { useMemo, useRef } from 'react'

import dynamic from 'next/dynamic'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Carousel } from '@mantine/carousel'
import { createStyles, getStylesRef, rem } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { clsx } from 'clsx'
import Autoplay from 'embla-carousel-autoplay'

import { useScrollDirection } from '@/core/hooks/use-scroll-direction'

const DesktopMenu = dynamic(() => import('./desktop').then(module => module.DesktopMenu))
const MobileMenu = dynamic(() => import('./mobile').then(module => module.MobileMenu))

const useStyles = createStyles(() => ({
  controls: {
    opacity: 0,
    ref: getStylesRef('controls'),
    transition: 'opacity 150ms ease',
  },

  root: {
    '&:hover': {
      [`& .${getStylesRef('controls')}`]: {
        opacity: 1,
      },
    },

    height: rem(48),
    lineHeight: rem(48),
  },
}))

export const Header = () => {
  const { classes } = useStyles()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const ref = useRef<HTMLElement | null>(null)
  const autoplay = useRef(Autoplay({ delay: 10000 }))
  const { direction, scrollTop } = useScrollDirection()
  const headerHeight = ref?.current?.clientHeight || 0

  const nextControlIcon = useMemo(
    () => (
      <ChevronRightIcon
        aria-label="Previous message"
        className="h-4 w-4 bg-neutral-900 text-neutral-50"
      />
    ),
    []
  )
  const previousControlIcon = useMemo(
    () => (
      <ChevronLeftIcon aria-label="Next message" className="h-4 w-4 bg-black text-neutral-50" />
    ),
    []
  )
  const plugins = useMemo(() => [autoplay.current], [])

  return (
    <header
      ref={ref}
      className={clsx(
        'sticky top-0 z-20 h-[10.5rem] transition-all delay-150 duration-500 lg:h-52',
        direction === 'down' && scrollTop > headerHeight ? '-translate-y-52' : 'translate-y-0'
      )}
    >
      <div className="relative top-0 left-0 z-20 w-full bg-neutral-50 text-neutral-900">
        <div className="shadow">
          <div
            className={`
              flex h-12 items-center border-b border-neutral-300 bg-neutral-900
              text-neutral-50
            `}
          >
            <div className="container mx-auto text-center">
              <Carousel
                loop
                withControls
                withIndicators
                align="center"
                classNames={classes}
                nextControlIcon={nextControlIcon}
                plugins={plugins}
                previousControlIcon={previousControlIcon}
              >
                <Carousel.Slide>
                  <strong>FREE SHIPPING</strong> all weekend
                </Carousel.Slide>
                <Carousel.Slide>
                  <strong>HURRY UP</strong>
                </Carousel.Slide>
              </Carousel>
            </div>
          </div>
          <div className="flex flex-col">{isDesktop ? <DesktopMenu /> : <MobileMenu />}</div>
        </div>
      </div>
    </header>
  )
}
