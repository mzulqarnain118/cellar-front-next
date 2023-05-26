import { useEffect, useMemo, useState } from 'react'

import { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { SliceZone } from '@prismicio/types'

import { createClient } from '@/prismic-io'

import { Simplify } from '../types/prismic'

export const useBrand = (brandUid?: string) => {
  const client = createClient()
  const [brandLandingData, setBrandLandingData] = useState<
    | Pick<
        Simplify<Content.BrandLandingTempDocumentDataBrandsItem>,
        'brand' | 'brand_image' | 'brand_link'
      >
    | undefined
  >()
  const [productShowcaseData, setProductShowcaseData] =
    useState<SliceZone<Content.RichContentPageDocumentDataBodySlice>>()
  const [imageAndTextData, setImageAndTextData] =
    useState<SliceZone<Content.RichContentPageDocumentDataBodyImageAndTextSlice>>()

  useEffect(() => {
    const getBrand = async () => {
      if (brandUid !== undefined && brandUid.length > 0) {
        try {
          const response = await Promise.all([
            client.getByUID<Content.RichContentPageDocument>('rich_content_page', brandUid, {
              graphQuery: `{
              rich_content_page {
                body {
                  ...on dynamic_product_showcase {
                    non-repeat {
                      brand
                    }
                    repeat {
                      ...repeatFields
                    }
                  }
                }
              }
            }`,
            }),
            client.getByUID('rich_content_page', brandUid, {
              graphQuery: `{
              rich_content_page {
                body {
                  ...on image_and_text {
                    non-repeat {
                      content
                      image
                    }
                  }
                }
              }
            }`,
            }),
            client.getSingle('brand-landing-temp', {
              graphQuery: `{
              brand-landing-temp {
                brands {
                  brand
                  brand_image
                  brand_link
                }
              }
            }`,
            }),
          ])
          setProductShowcaseData(response[0].data.body)
          setImageAndTextData(
            response[1].data
              .body as SliceZone<Content.RichContentPageDocumentDataBodyImageAndTextSlice>
          )
          setBrandLandingData(
            response[2].data.brands.find(
              ({ brand }) => asText(brand).toLowerCase().replaceAll(' ', '-') === brandUid
            )
          )
        } catch {
          // console.log()
        }
      }
    }

    getBrand()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return useMemo(
    () => ({ brandLandingData, imageAndTextData, productShowcaseData }),
    [brandLandingData, imageAndTextData, productShowcaseData]
  )
}
