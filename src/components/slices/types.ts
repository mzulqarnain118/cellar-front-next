import * as prismicT from '@prismicio/types'

export interface BrandData {
  name?: string
  image: string
  link?: string
  uid?: string
}

export type BrandGallerySlice = prismicT.Slice<
  'brand_gallery',
  {
    highlightColor: string
    title: { text: string } | null
  },
  {
    brand: {
      url: string
      uid: string
    } | null
    brand_image: { url: string }
    brandName: { text: string } | null
  }
>
