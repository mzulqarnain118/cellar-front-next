import type { CSSProperties } from 'react'

import type { Content } from '@prismicio/client'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

type BrandProfileProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyBrandProfileSlice>

export const BrandProfile = ({ slice }: BrandProfileProps) => (
  <div
    className="py-16 text-center"
    style={{ backgroundColor: slice.primary.background_color || 'transparent' }}
  >
    <div
      className="mb-8 md:mb-6 h3 font-heading"
      style={
        {
          '--highlight': slice.primary.highlight_color,
          color: slice.primary.text_color,
        } as CSSProperties
      }
    >
      <PrismicRichText field={slice.primary.title} />
    </div>
    <div
      className="lg:flex lg:items-center lg:justify-center lg:divide-x-2"
      style={{ color: slice.primary.text_color || 'inherit' }}
    >
      {slice.items?.map(item => (
        <div
          key={JSON.stringify(item.attribute)}
          className={`border-[${slice.primary.highlight_color}] lg:px-10 lg:tracking-widest`}
          style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
        >
          <PrismicRichText field={item.attribute} />
        </div>
      ))}
    </div>
  </div>
)
