import { useMemo, useRef } from 'react'

import { Carousel } from '@mantine/carousel'
import { createStyles, getStylesRef } from '@mantine/core'
import { asText } from '@prismicio/client'
import { PrismicRichText } from '@prismicio/react'
import Autoplay from 'embla-carousel-autoplay'

import { useCartPromoMessagesQuery } from '@/features/cart/queries'

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
  },
}))

export const Ticker = () => {
  const { classes } = useStyles()
  const { data: messages, isFetching, isLoading } = useCartPromoMessagesQuery()
  const autoplay = useRef(Autoplay({ delay: 4000 }))
  const plugins = useMemo(() => [autoplay.current], [])

  const slides = useMemo(
    () =>
      messages?.data.promos.map(message => (
        <Carousel.Slide
          key={asText(message.msg)}
          className="items-center inline-flex justify-center flex-col"
        >
          <PrismicRichText field={message.msg} />
        </Carousel.Slide>
      )),
    [messages?.data.promos]
  )

  if (isFetching || isLoading) {
    return (
      <div className="mx-4 mt-4">
        <div className="h-[163px] rounded bg-neutral-300 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex mt-4 items-center">
      <div className="container mx-auto text-center">
        <Carousel loop classNames={classes} plugins={plugins}>
          {slides}
        </Carousel>
      </div>
    </div>
  )
}
