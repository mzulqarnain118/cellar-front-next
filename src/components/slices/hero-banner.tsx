import type { CSSProperties } from 'react'

import type { Content } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'
import { clsx } from 'clsx'

type HeroBannerProps = SliceComponentProps<Content.RichContentPageDocumentDataBodyHeroBannerSlice>

const imageDimensions = { height: 'auto', width: 'auto' }

export const HeroBanner = ({ slice }: HeroBannerProps) => (
  <div
    className={`
      mx-auto flex min-h-[31rem] flex-col items-center justify-center bg-cover bg-center
      bg-no-repeat lg:min-h-[37rem]
    `}
    style={{
      backgroundColor: slice.primary.background_color || 'transparent',
      backgroundImage: `url(${slice.primary.background_image.url || 'none'})`,
    }}
  >
    {slice.primary.content && (
      <div
        className={clsx(
          'mx-auto flex w-full justify-center p-4 lg:justify-end',
          slice.primary.center_content
            ? '!justify-center lg:!justify-center'
            : '!justify-end lg:!justify-end'
        )}
      >
        <div className="flex flex-col items-center justify-center">
          <PrismicNextImage field={slice.primary.logo} style={imageDimensions} width={350} />
          <section
            className="flex flex-col items-center text-center [&>*]:!normal-case"
            style={{ '--highlight': slice.primary.highlight_color || 'inherit' } as CSSProperties}
          >
            <PrismicRichText field={slice.primary.content} />
          </section>

          {/* {slice.primary.ctaLink?.text && (
              <ButtonLink
                backgroundColor={slice.primary.ctaBackgroundColor || undefined}
                className="mt-4 font-body"
                size="large"
                textColor={slice.primary.ctaTextColor || undefined}
                title={slice.primary.ctaText?.text}
                to={slice.primary.ctaLink.text}
              >
                {slice.primary.ctaText?.text}
              </ButtonLink>
            )} */}
        </div>
      </div>
    )}
  </div>
)
