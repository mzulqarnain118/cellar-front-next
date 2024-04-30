import dynamic from 'next/dynamic'

import { Content, FilledContentRelationshipField } from '@prismicio/client'

import { Sort } from '../product-listing'

const ProductListing = dynamic(
  () => import('../product-listing').then(({ ProductListing }) => ProductListing),
  { ssr: true }
)

interface PlpShellProps {
  banner?: FilledContentRelationshipField<'plp_banner', string, Content.PlpBannerDocumentData>
  categories?: number[]
  notCategories?: number[]
  enabledFilters?: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>[]
  limit: number
  page: number
  pageUrl?: string | null
  sort: Sort
}

export const PlpShell = ({
  banner,
  categories,
  enabledFilters,
  notCategories,
  limit,
  page: currentPage,
  pageUrl,
  search = '',
  sort,
}: PlpShellProps) => (
  <main>
    <div>
      <ProductListing
        banner={banner}
        categories={categories}
        enabledFilters={
          enabledFilters as FilledContentRelationshipField<
            'filter',
            string,
            Content.FilterDocumentData
          >[]
        }
        limit={limit}
        notCategories={notCategories}
        page={currentPage}
        pageUrl={pageUrl}
        search={search}
        sort={sort}
      />
    </div>
  </main>
)
