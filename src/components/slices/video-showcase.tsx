import { CSSProperties } from 'react'

import { Content } from '@prismicio/client'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

type VideoShowcaseProps =
  SliceComponentProps<Content.RichContentPageDocumentDataBodyVideoShowcaseSlice>

export const VideoShowcase = ({ slice }: VideoShowcaseProps) => (
  <div
    style={{
      background:
        'radial-gradient(40.78% 40.78% at 56.61% -7.33%, rgba(224, 215, 211, 0.15) 0%, rgba(224, 215, 211, 0) 100%), rgb(35, 31, 32)',
    }}
  >
    <div className="container mx-auto grid items-center lg:grid-cols-2">
      {!!slice.primary.video.html && (
        <div
          dangerouslySetInnerHTML={{ __html: slice.primary.video.html }}
          className="h-80 lg:h-[30rem] lg:max-h-[30rem] [&>iframe]:h-full [&>iframe]:w-full"
        />
      )}
      <div className="p-11 text-center lg:text-left">
        <div
          className="mb-4 !text-neutral-50 lg:mb-8"
          style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
        >
          <PrismicRichText field={slice.primary.title} />
        </div>
        <div className="text-neutral-50 lg:text-xl">
          <PrismicRichText field={slice.primary.subtitle} />
        </div>
      </div>
    </div>
  </div>
)
