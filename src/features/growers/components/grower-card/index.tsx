import { useCallback } from 'react'

import { useRouter } from 'next/router'

import { ImageField, RichTextField, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'

import { Typography } from '@/core/components/typogrpahy'

interface GrowerCardProps {
  data: {
    alt: RichTextField
    image: ImageField<never>
    name: RichTextField
    region: RichTextField
    slug?: string
  }
}

export const GrowerCard = ({ data }: GrowerCardProps) => {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(`/growers/${data.slug}`)
  }, [data.slug, router])

  return (
    <div key={data.slug}>
      <div className="overflow-hidden">
        <PrismicNextImage
          className="cursor-pointer w-full block transition-transform duration-500 hover:scale-110"
          field={data.image}
          onClick={handleClick}
        />
      </div>
      <Typography as="h5">{asText(data.region)}</Typography>
      <Typography as="h4">{asText(data.name)}</Typography>
    </div>
  )
}
