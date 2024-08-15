import { CSSProperties, useCallback, useMemo } from 'react'

import { useRouter } from 'next/router'

import type { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'
import { clsx } from 'clsx'

import { Button } from '@/core/components/button'

const imageStyle = { height: 'auto', minWidth: '120px', width: '18vw' }

type HeroBannerProps = SliceComponentProps<Content.RichContentPageDocumentDataBodyHeroBannerSlice>

export const HeroBanner = ({ slice }: HeroBannerProps) => {
  const router = useRouter()
  const bgOpacity = slice.primary.background_video_opacity
    ? slice.primary.background_video_opacity / 100 || 100
    : 100

  const bgVideoUrl =
    !!slice.primary.background_video && 'url' in slice.primary.background_video
      ? slice.primary.background_video.url
      : ''

  const handleBgClick = useCallback(() => {
    router.push(asText(slice.primary.cta_link))
  }, [router, slice.primary.cta_link])

  const style = useMemo(
    () => ({
      backgroundColor: slice.primary.cta_background_color || undefined,
      color: slice.primary.cta_text_color || undefined,
    }),
    [slice.primary.cta_background_color, slice.primary.cta_text_color]
  )

  const children = useMemo(
    () => (
      <div
        className={clsx(
          'mx-auto flex w-full justify-center p-4 lg:justify-end',
          !!bgVideoUrl && bgVideoUrl.length > 0 && 'absolute z-10'
        )}
      >
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
              <PrismicNextImage
                priority
                field={slice.primary.logo}
                style={imageStyle}
                width={200}
              />
              {asText(slice.primary.content).length > 0 ? (
                <section
                  className="flex flex-col items-center text-center [&>*]:!normal-case"
                  style={
                    { '--highlight': slice.primary.highlight_color || 'inherit' } as CSSProperties
                  }
                >
                  <PrismicRichText field={slice.primary.content} />
                </section>
              ) : undefined}
              {asText(slice.primary.cta_text).length > 0 ? (
                <Button className="mt-4 border-0" size="lg" style={style} onClick={handleBgClick}>
                  {asText(slice.primary.cta_text)}
                </Button>
              ) : undefined}
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
      style,
    ]
  )

  return (
    <>
      <div
        className={clsx(
          'relative mx-auto flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat lg:min-h-[600px]'
        )}
        style={{
          backgroundColor:
            !!bgVideoUrl && bgVideoUrl.length > 0
              ? '#ffffff'
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
            className="top-0 left-0 w-screen object-contain md:object-cover lg:absolute lg:h-[600px]  xs:h-[320px] xs:object-cover"
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
