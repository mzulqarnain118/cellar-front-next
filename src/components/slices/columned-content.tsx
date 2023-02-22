import { CSSProperties } from 'react'

import type { Content } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

type ColumnedContentProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyColumnedContentSlice>

export const ColumnedContent = ({ slice }: ColumnedContentProps) => {
  const columns = slice.items.filter(col => !!col.image.url)

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
        color: slice.primary.text_color || undefined,
      }}
    >
      <div className="container mx-auto items-center p-4 py-10 text-center font-heading">
        <div
          className="pb-5"
          style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
        >
          <PrismicRichText field={slice.primary.headline} />
        </div>
        <div className="!font-body">
          {!!columns && (
            <div className="flex flex-col lg:flex-row lg:space-x-20">
              {columns.map(column => (
                <div key={column.image.url} className="flex-1">
                  <PrismicNextImage field={column.image} />
                  <div
                    className="py-4 lg:pb-0"
                    style={{ '--highlight': column.highlight_color } as CSSProperties}
                  >
                    <PrismicRichText field={column.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <hr className="bg-light-gray border-1 border-light-gray my-10" />
          <div
            className="[&>p]:text-lg"
            style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
          >
            <PrismicRichText field={slice.primary.content} />
          </div>
          {/* {slice.primary.ctaLink?.text && (
            <div className="font-body">
              <ButtonLink
                backgroundColor={slice.primary.ctaBackgroundColor || undefined}
                className="mt-4"
                size="large"
                textColor={slice.primary.ctaTextColor || undefined}
                title={slice.primary.ctaText?.text}
                to={slice.primary.ctaLink.text}
              >
                {slice.primary.ctaText?.text}
              </ButtonLink>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
