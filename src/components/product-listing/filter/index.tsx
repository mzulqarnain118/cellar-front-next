import dynamic from 'next/dynamic'

import type { Content, FilledContentRelationshipField } from '@prismicio/client'

import { ProductsSchema } from '@/lib/types/schemas/product'

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
  products: ProductsSchema[]
}

export const Filter = ({ data, products }: FilterProps) => {
  switch (data.slug) {
    case 'brand':
      return <BrandFilter products={products} slug={data.slug} values={data.data?.values} />
    case 'pairing-notes':
      return <PairingNoteFilter products={products} slug={data.slug} values={data.data?.values} />
    case 'price':
      return <PriceFilter slug={data.slug} />
    case 'country':
      return <CountryFilter slug={data.slug} values={data.data?.values} />
    case 'tasting-notes':
      return <TastingNoteFilter products={products} slug={data.slug} values={data.data?.values} />
    case 'varietal':
      return <VarietalFilter products={products} slug={data.slug} values={data.data?.values} />
    case 'structure':
      return <StructureFilter products={products} slug={data.slug} values={data.data?.values} />
    default:
      return data.data ? <CustomFilter filter={data?.data} /> : <></>
  }
}
