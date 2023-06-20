import { CSSProperties, useCallback, useMemo } from 'react'

import { Content, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'
import { clsx } from 'clsx'

import { Button } from '@/core/components/button'
import { useConsultantQuery } from '@/lib/queries/consultant'

import { Link } from '../link'

type ImageAndTextProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyImageAndTextSlice>

export const ImageAndText = ({ slice }: ImageAndTextProps) => {
  const { data: consultant } = useConsultantQuery()

  const ctaLink = useMemo(() => {
    if (
      typeof window !== 'undefined' &&
      asText(slice.primary.cta_link).startsWith('https://join')
    ) {
      const url = new URL(asText(slice.primary.cta_link))
      if (consultant?.url) {
        url.searchParams.append('u', consultant.url)
      }
      return url.toString()
    }
  }, [consultant?.url, slice.primary.cta_link])

  const linkText = useMemo(
    () => ctaLink || asText(slice.primary.cta_link),
    [ctaLink, slice.primary.cta_link]
  )

  const linkStyle = useMemo(
    () => ({
      backgroundColor: slice.primary.cta_background_color || undefined,
      color: slice.primary.cta_text_color || undefined,
    }),
    [slice.primary.cta_background_color, slice.primary.cta_text_color]
  )

  const handleExternalLinkClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(linkText, '_blank')
    }
  }, [linkText])

  return (
    <div
      style={{
        backgroundColor: slice.primary.background_color || '#ffffff',
        backgroundImage: slice.primary.background_image?.url
          ? `url(${slice.primary.background_image.url})`
          : undefined,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div
        className={`container mx-auto flex items-center p-4 md:space-x-20 [&>*]:flex-1 ${
          slice.primary.text_on_left
            ? 'flex-col-reverse md:flex-row-reverse'
            : 'flex-col-reverse md:flex-row'
        }`}
      >
        <div
          className={clsx('py-5 md:px-5 md:py-0', !!slice.primary.center_content && '!text-center')}
        >
          <div
            className={clsx(
              'block pb-3 text-center lg:pb-5',
              !!slice.primary.center_content && '!text-center'
            )}
            style={{ '--highlight': slice.primary.highlight_color || 'inherit' } as CSSProperties}
          >
            <PrismicRichText field={slice.primary.headline} />
          </div>
          <div className="prose leading-none">
            <PrismicRichText field={slice.primary.content} />
          </div>
          {linkText ? (
            <div
              className={clsx(
                'text-center md:text-left',
                (!slice.primary.image.url?.length || slice.primary.center_content) && '!text-center'
              )}
            >
              {linkText.startsWith('http') ? (
                <Button
                  className="mt-4 font-body"
                  style={linkStyle}
                  onClick={handleExternalLinkClick}
                >
                  {asText(slice.primary.cta_text)}
                </Button>
              ) : (
                <Link
                  button
                  className="mt-4 font-body"
                  href={linkText}
                  style={linkStyle}
                  title={asText(slice.primary.cta_text)}
                >
                  {asText(slice.primary.cta_text)}
                </Link>
              )}
            </div>
          ) : undefined}
        </div>
        {slice.primary.image.url ? (
          <div className={clsx('md:py-14', slice.primary.text_on_left && '!ml-0')}>
            <PrismicNextImage field={slice.primary.image} />
          </div>
        ) : undefined}
      </div>
    </div>
  )
}
