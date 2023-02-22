import type { CSSProperties } from 'react'

import type { Content } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'
import { clsx } from 'clsx'

type ImageAndTextProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyImageAndTextSlice>

export const ImageAndText = ({ slice }: ImageAndTextProps) => (
  <div
    style={{
      backgroundColor: slice.primary.background_color || 'transparent',
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
        className={clsx('py-5 md:py-0 md:px-5', !!slice.primary.center_content && 'text-center')}
      >
        <div
          className="block pb-3 text-center md:text-left lg:pb-5"
          style={{ '--highlight': slice.primary.highlight_color || 'inherit' } as CSSProperties}
        >
          <PrismicRichText field={slice.primary.headline} />
        </div>
        <PrismicRichText field={slice.primary.content} />
        {/* {slice.primary.cta_link && (
          <div className="text-center md:text-left">
            <ButtonLink
              backgroundColor={slice.primary.cta_background_color || undefined}
              className="mt-4 font-body"
              textColor={slice.primary.cta_text_color || undefined}
              title={slice.primary.ctaText?.text}
              to={slice.primary.ctaLink.text}
            >
              {slice.primary.ctaText?.text}
            </ButtonLink>
          </div>
        )} */}
      </div>
      <div className={`md:py-14${!slice.primary.text_on_left ? '' : ' !ml-0'}`}>
        <PrismicNextImage field={slice.primary.image} />
        {/* <GatsbyImage alt={slice.primary.image?.alt || 'Column Image'} image={image} /> */}
      </div>
    </div>
  </div>
)
