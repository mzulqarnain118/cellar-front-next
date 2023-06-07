import dynamic from 'next/dynamic'

import { Content, FilledContentRelationshipField } from '@prismicio/client'

import { Sort } from '../product-listing'

const ProductListing = dynamic(
  () => import('../product-listing').then(({ ProductListing }) => ProductListing),
  { ssr: true }
)

interface PlpShellProps {
  categories?: number[]
  enabledFilters: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>[]
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
  <main>
    <div>
      <ProductListing
        categories={categories}
        enabledFilters={
          enabledFilters as FilledContentRelationshipField<
            'filter',
            string,
            Content.FilterDocumentData
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
