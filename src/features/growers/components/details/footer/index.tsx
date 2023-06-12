import { ImageField } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'

interface GrowerDetailFooterProps {
  data: {
    image: ImageField<never>
  }
}

export const GrowerDetailFooter = ({ data }: GrowerDetailFooterProps) => (
  <div>
    <div className="max-h-[600px] h-[600px] relative w-full">
      <PrismicNextImage fill className="object-cover" field={data.image} />
    </div>
  </div>
)
