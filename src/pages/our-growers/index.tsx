import { useMemo, useState } from 'react'

import { asText } from '@prismicio/client'
import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next'

import { GrowerBox } from '@/features/growers/components/grower-box'
import { GrowerHeading } from '@/features/growers/components/heading'
import { RegionSelect } from '@/features/growers/components/region-select'
import { createClient } from '@/prismic-io'

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
  const client = createClient({ previewData })
  const page = await client.getSingle('grower-template')

  return {
    props: {
      page: page || null,
    },
  }
}

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const OurGrowersPage: NextPage<PageProps> = ({ page }) => {
  const [state, setState] = useState('')
  const headingData = useMemo(
    () => ({
      alt: page.data['image-alt-text'],
      backgroundImage: page.data['background-image'],
      subTitle: page.data['sub-title'],
      title: page.data.title,
    }),
    [page.data]
  )
  const growsData = page.data.growers.map(item => ({
    alt: item['image-alt-text1'],
    image: item['grower-image'],
    name: item['grower-name'],
    region: item['grower-region'],
    slug: item.grower.link_type !== 'Any' && 'uid' in item.grower ? item.grower.uid : '',
  }))
  const filteredGrows = growsData.filter(item => asText(item.region) === state || !state)
  const growerStates = growsData.reduce<{ label: string; value: string }[]>(
    (result, item) =>
      result.find(cItem => cItem.value === asText(item.region))
        ? result
        : [...result, { label: asText(item.region), value: asText(item.region) }],
    []
  )

  return (
    <div className="mb-10">
      <GrowerHeading data={headingData} />
      <RegionSelect state={state} states={growerStates} onChange={setState} />
      <GrowerBox data={filteredGrows} />
    </div>
  )
}

export default OurGrowersPage
