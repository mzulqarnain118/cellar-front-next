import { ImageField, RichTextField } from '@prismicio/client'

import { GrowerCard } from '../grower-card'

interface GrowerBoxProps {
  data: {
    alt: RichTextField
    image: ImageField<never>
    name: RichTextField
    region: RichTextField
    slug?: string
  }[]
}

export const GrowerBox = ({ data }: GrowerBoxProps) => (
  <div className="max-w-screen-xl m-auto w-4/5">
    <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-5">
      {data.map(item => (
        <GrowerCard key={item.slug} data={item} />
      ))}
    </div>
  </div>
)
