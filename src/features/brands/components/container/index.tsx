import { ImageField, LinkField, RichTextField, TitleField, asText } from '@prismicio/client'

import { BrandTile } from '../tile'

interface BrandContainerProps {
  data: {
    image: ImageField<never>
    link: LinkField
    linkLocation: RichTextField
    name: TitleField
    openLinkInNewTab: boolean
  }[]
}

export const BrandContainer = ({ data }: BrandContainerProps) => (
  <div className="pt-6 bg-base-light px-[12%]">
    <div
      className={`
        z-10 -mt-20 mb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        2xl:grid-cols-5 place-items-center
      `}
    >
      {data && !!data.length && data.map(item => <BrandTile key={asText(item.name)} item={item} />)}
    </div>
  </div>
)
