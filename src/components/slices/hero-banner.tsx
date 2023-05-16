import { CSSProperties, useCallback, useMemo } from 'react'

import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, PrismicText, SliceComponentProps } from '@prismicio/react'
import { clsx } from 'clsx'
import { useRouter } from 'next/router'

import { Button } from '@/core/components/button'

type HeroBannerProps = SliceComponentProps<Content.RichContentPageDocumentDataBodyHeroBannerSlice>

export const HeroBanner = ({ slice }: HeroBannerProps) => {
  const router = useRouter()
  const bgOpacity = slice.primary.background_video_opacity
    ? slice.primary.background_video_opacity / 100 || 100
    : 100

  const bgVideoUrl =
    !!slice.primary.background_video && 'url' in slice.primary.background_video
      ? slice.primary.background_video.url
      : undefined

  const handleBgClick = useCallback(() => {
    router.push(asText(slice.primary.cta_link))
  }, [router, slice.primary.cta_link])

  const _style = useMemo(
    () => ({
      backgroundColor: slice.primary.cta_background_color || undefined,
      color: slice.primary.cta_text_color || undefined,
    }),
    [slice.primary.cta_background_color, slice.primary.cta_text_color]
  )

  const children = useMemo(
    () => (
      <div className={clsx(!!bgVideoUrl && bgVideoUrl.length > 0 && 'absolute z-10')}>
        {slice.primary.content ? (
          <div
            className={clsx(
              'mx-auto flex w-full justify-center p-4 lg:justify-end',
              slice.primary.center_content
                ? '!justify-center lg:!justify-center'
                : '!justify-end lg:!justify-end'
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <PrismicNextImage priority field={slice.primary.logo} width={350} />
              <section
                className="flex flex-col items-center text-center [&>*]:!normal-case"
                style={
                  { '--highlight': slice.primary.highlight_color || 'inherit' } as CSSProperties
                }
              >
                <PrismicRichText field={slice.primary.content} />
              </section>
              <Button className="mt-4" size="lg" onClick={handleBgClick}>
                <PrismicText field={slice.primary.cta_text} />
              </Button>
            </div>
          </div>
        ) : undefined}
      </div>
    ),
    [
      bgVideoUrl,
      handleBgClick,
      slice.primary.center_content,
      slice.primary.content,
      slice.primary.cta_text,
      slice.primary.highlight_color,
      slice.primary.logo,
    ]
  )

  return (
    <>
      <div
        className={clsx(
          'mx-auto flex min-h-[500px] flex-col items-center justify-center bg-cover bg-center bg-no-repeat lg:min-h-[600px]'
        )}
        style={{
          backgroundColor:
            !!bgVideoUrl && bgVideoUrl.length > 0
              ? '#000000'
              : slice.primary.background_color || '#ffffff',
          backgroundImage:
            !!bgVideoUrl && bgVideoUrl.length > 0
              ? undefined
              : `url(${slice.primary.background_image.url || 'none'})`,
        }}
      >
        {!!bgVideoUrl && bgVideoUrl.length > 0 && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-[600px] w-screen object-cover"
            style={{ opacity: bgOpacity }}
          >
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
        )}
        {children}
      </div>
    </>
  )
}
