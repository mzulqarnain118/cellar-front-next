import { useCallback } from 'react'

import { useRouter } from 'next/router'

import { ImageField, LinkField, RichTextField, TitleField, asLink, asText } from '@prismicio/client'
import { PrismicNextImage } from '@prismicio/next'

interface BrandTileProps {
  item: {
    image: ImageField<never>
    link: LinkField
    linkLocation: RichTextField
    name: TitleField
    openLinkInNewTab: boolean
  }
}

export const BrandTile = ({ item }: BrandTileProps) => {
  const router = useRouter()

  const handleClick = useCallback(() => {
    // Identify brand on base of name, If name is not available trigger event with image alt
    // If image alt is not available then identify the brand with brand link
    if (item.link) {
      router.push(`/brands/${asLink(item.link)}`)
    } else if (item.linkLocation) {
      window.open(asText(item.linkLocation), item.openLinkInNewTab ? '_blank' : '_self')
    }
  }, [item.link, item.linkLocation, item.openLinkInNewTab, router])

  return (
    <div className="text-center pb-12">
      <button
        className="bg-base-light h-[200px] w-[200px] mb-3 flex justify-center items-center cursor-pointer"
        onClick={handleClick}
      >
        <PrismicNextImage
          className="hover:scale-110 transition-transform"
          field={item.image}
          height={200}
          width={200}
        />
      </button>
    </div>
  )
}
