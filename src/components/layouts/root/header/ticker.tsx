import { useMemo, useRef } from 'react'

import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'

import { Typography } from '@/core/components/typogrpahy'

export const Ticker = () => {
  const autoplay = useRef(Autoplay({ delay: 10000 }))
  const plugins = useMemo(() => [autoplay.current], [])

  return (
    <div
      className={`
        flex h-12 items-center border-b border-neutral-300 bg-neutral-900
        text-neutral-50
      `}
    >
      <div className="container mx-auto text-center">
        <Carousel loop withControls plugins={plugins}>
          <Carousel.Slide>
            <Typography as="strong">FREE SHIPPING</Typography> all weekend
          </Carousel.Slide>
          <Carousel.Slide>
            <Typography as="strong">HURRY UP</Typography>
          </Carousel.Slide>
        </Carousel>
      </div>
    </div>
  )
}
