import dynamic from 'next/dynamic'

import { Content, FilledContentRelationshipField } from '@prismicio/client'

import { Sort } from '../product-listing'

const ProductListing = dynamic(
  () => import('../product-listing').then(({ ProductListing }) => ProductListing),
  { ssr: true }
)

interface PlpShellProps {
  categories?: number[]
  enabledFilters: FilledContentRelationshipField<'filter', string, Content.FilterDocument>[]
  limit: number
  page: number
  search?: string
  sort: Sort
}

export const PlpShell = ({
  categories,
  enabledFilters,
  limit,
  page: currentPage,
  search = '',
  sort,
}: PlpShellProps) => (
  <main className="py-10">
    <div className="lg:max-w-screen-[1980px] mx-4 lg:mx-20">
      <ProductListing
        categories={categories}
        enabledFilters={
          enabledFilters as FilledContentRelationshipField<
            'filter',
            string,
            Content.FilterDocument
          >[]
        }
        limit={limit}
        page={currentPage}
        search={search}
        sort={sort}
      />
    </div>
  </main>
)
