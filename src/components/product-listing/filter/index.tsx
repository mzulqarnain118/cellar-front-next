import dynamic from 'next/dynamic'

import { Content, FilledContentRelationshipField } from '@prismicio/client'

const BrandFilter = dynamic(() => import('./brand').then(({ BrandFilter }) => BrandFilter))
const PairingNoteFilter = dynamic(() =>
  import('./pairing-note').then(({ PairingNoteFilter }) => PairingNoteFilter)
)
const PriceFilter = dynamic(() => import('./price').then(({ PriceFilter }) => PriceFilter))
const TastingNoteFilter = dynamic(() =>
  import('./tasting-note').then(({ TastingNoteFilter }) => TastingNoteFilter)
)
const VarietalFilter = dynamic(() =>
  import('./varietal').then(({ VarietalFilter }) => VarietalFilter)
)

interface FilterProps {
  data: FilledContentRelationshipField<'filter', string, Content.FilterDocument>
}

export const Filter = ({ data }: FilterProps) => (
  <>
    {data.slug === 'brand' ? <BrandFilter slug={data.slug} /> : undefined}
    {data.slug === 'price' ? <PriceFilter slug={data.slug} /> : undefined}
    {data.slug === 'varietal' ? <VarietalFilter slug={data.slug} /> : undefined}
    {data.slug === 'pairing-notes' ? <PairingNoteFilter slug={data.slug} /> : undefined}
    {data.slug === 'tasting-notes' ? <TastingNoteFilter slug={data.slug} /> : undefined}
  </>
)
