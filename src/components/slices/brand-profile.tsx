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
      className="mb-2"
      style={
        {
          '--highlight': slice.primary.highlight_color,
          color: slice.primary.text_color,
        } as CSSProperties
      }
    >
      <PrismicRichText field={slice.primary.title} />
    </div>
    {/* {slice.primary.title && (
      <div
        dangerouslySetInnerHTML={{
          __html: highlightString(
            slice.primary.title.text,
            slice.primary.highlightColor || 'inherit'
          ),
        }}
        className="h3 mb-2 block font-heading"
        style={{ color: slice.primary.text_color || 'inherit' }}
      />
    )} */}
    <div
      className="lg:flex lg:items-center lg:justify-center lg:divide-x-2"
      style={{ color: slice.primary.text_color || 'inherit' }}
    >
      {slice.items?.map(item => (
        <div
          key={JSON.stringify(item.attribute)}
          className="border-black lg:px-10 lg:tracking-widest"
          style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
        >
          <PrismicRichText field={item.attribute} />
        </div>
        // <div
        //   dangerouslySetInnerHTML={{
        //     __html: highlightString(
        //       item.attribute?.text || '',
        //       slice.primary.highlightColor || 'inherit'
        //     ),
        //   }}
        //   key={item.attribute?.text}
        //   className="block border-black font-body lg:px-10 lg:tracking-widest"
        // />
      ))}
    </div>
  </div>
)
