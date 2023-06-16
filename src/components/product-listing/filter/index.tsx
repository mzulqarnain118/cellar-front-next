import dynamic from 'next/dynamic'

import type { Content, FilledContentRelationshipField } from '@prismicio/client'

const BrandFilter = dynamic(() => import('./brand').then(({ BrandFilter }) => BrandFilter))
const CountryFilter = dynamic(() =>
  import('./country').then(({ CountryFilter: RegionFilter }) => RegionFilter)
)
const CustomFilter = dynamic(() => import('./custom').then(({ CustomFilter }) => CustomFilter))
const PairingNoteFilter = dynamic(() =>
  import('./pairing-note').then(({ PairingNoteFilter }) => PairingNoteFilter)
)
const PriceFilter = dynamic(() => import('./price').then(({ PriceFilter }) => PriceFilter))
const StructureFilter = dynamic(() =>
  import('./structure').then(({ StructureFilter }) => StructureFilter)
)
const TastingNoteFilter = dynamic(() =>
  import('./tasting-note').then(({ TastingNoteFilter }) => TastingNoteFilter)
)
const VarietalFilter = dynamic(() =>
  import('./varietal').then(({ VarietalFilter }) => VarietalFilter)
)

interface FilterProps {
  data: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>
}

export const Filter = ({ data }: FilterProps) => {
  switch (data.slug) {
    case 'brand':
      return <BrandFilter slug={data.slug} values={data.data?.values} />
    case 'pairing-notes':
      return <PairingNoteFilter slug={data.slug} values={data.data?.values} />
    case 'price':
      return <PriceFilter slug={data.slug} />
    case 'country':
      return <CountryFilter slug={data.slug} values={data.data?.values} />
    case 'tasting-notes':
      return <TastingNoteFilter slug={data.slug} values={data.data?.values} />
    case 'varietal':
      return <VarietalFilter slug={data.slug} values={data.data?.values} />
    case 'structure':
      return <StructureFilter slug={data.slug} values={data.data?.values} />
    default:
      return data.data ? <CustomFilter filter={data?.data} /> : <></>
  }
}
