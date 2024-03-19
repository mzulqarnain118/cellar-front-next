import { useMemo } from 'react'

import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'

import { BrandContainer } from '@/features/brands/components/container'
import { BrandHeading } from '@/features/brands/components/heading'
import { createClient } from '@/prismic-io'

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const page = await client.getSingle('brand-landing-temp')

  return {
    props: {
      page: page || null,
    },
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const BrandsPage: NextPage<PageProps> = ({ page }) => {
  const headingData = useMemo(
    () => ({
      image: page?.data.brand_background_image,
      subTitle: page?.data.brand_subtitle,
      title: page?.data.brand_title,
    }),
    [page?.data.brand_background_image, page?.data.brand_subtitle, page?.data.brand_title]
  )

  const brandsData = useMemo(
    () =>
      page?.data.brands?.map(brand => ({
        image: brand?.brand_image,
        link: brand?.brand_link,
        linkLocation: brand?.link,
        name: brand?.brand,
        openLinkInNewTab: brand?.open_link_in_new_tab || false,
      })),
    [page?.data.brands]
  )

  // const etnico = page?.data.brands?.filter(brandItem => brandItem.brand[0]?.text === 'Etnico')
  // console.log('Etnico: ', etnico)

  return (
    <>
      <BrandHeading data={headingData} />
      {brandsData !== undefined && <BrandContainer data={brandsData} />}
    </>
  )
}

export default BrandsPage
