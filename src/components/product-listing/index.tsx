import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { Pagination, PaginationProps, Select, SelectProps } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { Content, FilledContentRelationshipField } from '@prismicio/client'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { usePaginatedSearch } from '@/features/search/queries'
import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
import { usePaginatedProducts } from '@/lib/queries/products'
import { useConsultantStore } from '@/lib/stores/consultant'
import { useFiltersStore } from '@/lib/stores/filters'
import { CartItem, SubscriptionProduct } from '@/lib/types'
import { trackPlpListProducts } from '@/lib/utils/gtm-util'

import { ProductCard } from '../product-card'

import { FilterBar } from './filter/filter-bar'
import filterAndModifyEnabledFilters from './filter/utils/filterAndModifyEnabledFilters'
import { Filters } from './filters'

export type Sort = 'relevant' | 'price-low-high' | 'price-high-low'

export const DEFAULT_CATEGORIES = [DISPLAY_CATEGORY.Wine]
export const DEFAULT_LIMIT = 16
export const DEFAULT_PAGE = 1
export const DEFAULT_SORT: Sort = 'relevant'

const leftIcon = (
  <AdjustmentsHorizontalIcon className="h-8 w-8 transition-transform group-hover:rotate-90" />
)

const selectClassNames: SelectProps['classNames'] = {
  label: 'font-bold',
  root: 'text-right',
}
const selectData = [
  { label: 'Relevant', value: 'relevant' },
  { label: 'Price (low to high)', value: 'price-low-high' },
  { label: 'Price (high to low)', value: 'price-high-low' },
]
const selectStyles: SelectProps['styles'] = theme => ({
  item: {
    // applies styles to hovered item (with mouse or keyboard)
    '&[data-hovered]': {},

    // applies styles to selected item
    '&[data-selected]': {
      '&, &:hover': {
        backgroundColor:
          theme.colorScheme === 'dark' ? theme.colors.brand[9] : theme.colors.brand[1],
        color: theme.colorScheme === 'dark' ? theme.white : theme.colors.brand[9],
      },
    },
  },
})

interface ProductListingProps {
  banner?: FilledContentRelationshipField<'plp_banner', string, Content.PlpBannerDocumentData>
  categories?: number[]
  notCategories?: number[]
  enabledFilters?: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>[]
  page?: number
  pageUrl?: string | null
  limit?: number
  search?: string
  sort?: Sort
}

export const ProductListing = ({
  banner,
  categories = [],
  enabledFilters = [],
  page: initialPage = 1,
  pageUrl,
  notCategories: notcategories,
  limit = 16,
  search = '',
  sort: initialSort = 'relevant',
}: ProductListingProps) => {
  const { consultant } = useConsultantStore()
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const [active, setPage] = useState(initialPage)
  const [sort, setSort] = useState<Sort>(initialSort)
  const { data: session } = useSession()
  const pathname = usePathname()
  // Extract the segment after the last '/'
  const segments = pathname?.split('/') ?? []
  const circleExclusives = segments?.[segments?.length - 1]

  const [showFilters, setShowFilters] = useState(false)
  const [_, scrollTo] = useWindowScroll()

  const options = useMemo(
    () => ({ categories, limit, notcategories, page: active, search, sort }),
    [categories, notcategories, limit, active, search, sort]
  )

  const paginatedProducts = usePaginatedProducts(options, search.length === 0)
  const paginatedSearch = usePaginatedSearch(options, search.length > 0)
  const { data, isError, isFetching, isLoading } = useMemo(
    () => (search.length > 0 ? { ...paginatedSearch } : { ...paginatedProducts }),
    [paginatedProducts, paginatedSearch, search.length, options]
  )

  const { activeFilters } = useFiltersStore()

  const modifiedEnabledFilters =
    data &&
    enabledFilters &&
    filterAndModifyEnabledFilters(data?.allFilteredProducts, enabledFilters)

  const handleFilterClose = useCallback(() => setShowFilters(false), [])
  const onFilterToggle = useCallback(() => setShowFilters(prev => !prev), [])

  const filtersButton = useMemo(
    () =>
      modifiedEnabledFilters?.length > 0 ? (
        <div className={clsx('flex', showFilters && 'lg:min-w-[15rem]')}>
          <Button
            dark
            className={clsx('group')}
            size="sm"
            startIcon={leftIcon}
            onClick={onFilterToggle}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      ) : undefined,
    [modifiedEnabledFilters?.length, onFilterToggle, showFilters]
  )

  const filters = useMemo(
    () => (
      <div className="grid gap-4 pt-4">
        {filtersButton}
        <Filters
          enabledFilters={modifiedEnabledFilters}
          products={data?.allFilteredProducts}
          show={showFilters}
          onClose={handleFilterClose}
        />
      </div>
    ),
    [
      modifiedEnabledFilters,
      filtersButton,
      handleFilterClose,
      showFilters,
      data?.allFilteredProducts,
    ]
  )

  const noResults = useMemo(() => !data || data.products.length === 0, [data])
  //! added clean crafted selections filter
  const cleanCraftedSelections = useMemo(
    () => !!session?.user?.token && !!session?.user?.isClubMember,
    [session]
  )

  const filteredProducts = useMemo(
    () =>
      circleExclusives === 'circle-exclusives' && cleanCraftedSelections
        ? data?.products
        : circleExclusives === 'circle-exclusives'
          ? data?.products?.filter(
            product =>
              !product?.displayCategories?.includes(DISPLAY_CATEGORY['Clean Crafted Selections'])
          )
          : data?.products?.filter(
            product =>
              !product?.displayCategories?.includes(DISPLAY_CATEGORY['Clean Crafted Selections'])
          ),
    [data]
  )

  const productCards = useMemo(
    () =>
      filteredProducts !== undefined ? (
        <div>
          <div
            className={clsx(
              'transition-all grid gap-4 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 3xl:grid-cols-5 relative'
            )}
          >
            {filteredProducts?.map((product, index) => (
              <ProductCard key={product.sku} priority={index < 4} product={product} />
            ))}
          </div>
        </div>
      ) : undefined,
    [filteredProducts]
  )

  const onSortChange = useCallback((value: Sort) => {
    setSort(value)
    setPage(1)
  }, [])

  useEffect(() => {
    if (activeFilters.length > 0) {
      setPage(1)
    }
  }, [activeFilters])

  const paginationHeader = useMemo(
    () => (
      <>
        {isFetching || isLoading ? (
          <div className="h-6 w-60 animate-pulse rounded bg-neutral-300" />
        ) : noResults ? (
          <h3>No results were found with the selected filters</h3>
        ) : (
          <Typography>
            Showing {search.length > 0 ? `search results for "${search}": ` : undefined}
            {data?.resultsShown?.[0]}-{data?.resultsShown?.[1]} results of {data?.results}.
          </Typography>
        )}
        {isDesktop && !noResults ? (
          <div className="grid grid-cols-2 items-end gap-4 lg:gap-0 lg:grid-cols-[1fr_auto] justify-between w-full">
            <FilterBar />
            {search.length > 0 ? undefined : (
              <Select
                withinPortal
                classNames={selectClassNames}
                data={selectData}
                label="Sort by"
                styles={selectStyles}
                value={sort}
                onChange={onSortChange}
              />
            )}
          </div>
        ) : (
          <div
            className={clsx(
              'lg:grid lg:grid-cols-[auto_1fr] items-end justify-between',
              showFilters && 'lg:gap-10',
              modifiedEnabledFilters?.length === 0 && 'grid-cols-1'
            )}
          >
            <div
              className={clsx(
                'grid grid-cols-2 items-end gap-4 lg:gap-0 lg:grid-cols-[1fr_auto] justify-between w-full'
              )}
            >
              <FilterBar />
              {search.length > 0 ? undefined : (
                <Select
                  withinPortal
                  classNames={selectClassNames}
                  data={selectData}
                  label="Sort by"
                  styles={selectStyles}
                  value={sort}
                  onChange={onSortChange}
                />
              )}
            </div>
          </div>
        )}
      </>
    ),
    [
      data?.results,
      data?.resultsShown,
      modifiedEnabledFilters?.length,
      isDesktop,
      isFetching,
      isLoading,
      noResults,
      onSortChange,
      search,
      showFilters,
      sort,
    ]
  )

  const getControlProps: PaginationProps['getControlProps'] = useCallback(
    (control: 'first' | 'previous' | 'last' | 'next') => {
      const params = new URLSearchParams()
      if (consultant.url) {
        params.delete('u')
        params.set('u', consultant.url)
      }

      if (control === 'first') {
        params.delete('page')
        params.set('page', '1')
      }

      if (control === 'last') {
        params.delete('page')
        params.set('page', data?.totalNumberOfPages.toString() || '')
      }

      if (control === 'next') {
        params.delete('page')
        params.set(
          'page',
          active === data?.totalNumberOfPages ? active.toString() : (active + 1).toString()
        )
      }

      if (control === 'previous') {
        params.delete('page')
        params.set('page', active === 1 ? '1' : (active - 1).toString())
      }

      return {
        component: Link,
        href: `${router.pathname}?${params.toString()}`,
        scroll: true,
        shallow: true,
      }
    },
    [active, consultant.url, data?.totalNumberOfPages, router.pathname]
  )

  const getItemProps: PaginationProps['getItemProps'] = useCallback(
    (page: number) => {
      const params = new URLSearchParams()
      if (consultant.url) {
        params.delete('u')
        params.set('u', consultant.url)
      }

      params.delete('page')
      params.set('page', page.toString())

      return {
        component: Link,
        href: `${router.pathname}?${params.toString()}`,
        scroll: true,
        shallow: true,
      }
    },
    [consultant.url, router.pathname]
  )

  const onPageChange = useCallback(
    (page: number) => {
      scrollTo({ y: 0 })
      setPage(page)
    },
    [scrollTo]
  )

  // const bannerElement = useMemo(
  //   () => <PrismicNextImage className="mx-auto" field={banner?.data?.image} />,
  //   [banner?.data?.image]
  // )

  useEffect(() => {
    if (isDesktop) {
      setShowFilters(true)
    }
  }, [isDesktop])

  // Send PLP Listing Event to GTM
  useEffect(() => {
    if (data?.products !== undefined) {
      trackPlpListProducts(data?.products as [CartItem | SubscriptionProduct])
    }
  }, [data?.products])

  if (isFetching || isLoading) {
    return (
      <div
        className={clsx(
          'grid transition-all grid-cols-1 px-4 lg:px-0 lg:mx-10',
          showFilters && 'lg:grid-cols-[auto_1fr] lg:ml-2 lg:gap-10'
        )}
      >
        <div className="w-[16.25rem] max-w-[16.25rem]">{filters}</div>
        <div className="flex flex-col gap-4 py-10">
          {/* {bannerElement} */}
          {paginationHeader}
          <div className="transition-all grid gap-4 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 3xl:grid-cols-5 relative">
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
            <div className="animate-pulse rounded bg-neutral-300 h-[27.75rem]" />
          </div>
          <div className="mx-auto mt-6 flex items-center justify-center">
            <div className="h-[3rem] w-[2.5rem] animate-pulse rounded bg-neutral-300" />
            <div className="h-[3rem] w-[5rem] animate-pulse rounded bg-neutral-300" />
            <div className="h-[3rem] w-[2.5rem] animate-pulse rounded bg-neutral-300" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    // ! TODO: Something bad happened.
  }

  if (noResults) {
    return (
      <div
        className={clsx(
          'grid place-items-center lg:h-[700px] h-[400px]',
          modifiedEnabledFilters?.length === 0 && 'lg:!ml-10'
        )}
      >
        <div className="flex flex-col gap-4 py-10 text-center">{paginationHeader}</div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'grid transition-all grid-cols-1 px-4 lg:px-0 lg:mx-10',
        showFilters && 'lg:grid-cols-[auto_1fr] lg:ml-2 lg:gap-10',
        modifiedEnabledFilters?.length === 0 && 'lg:!ml-10'
      )}
    >
      {modifiedEnabledFilters?.length > 0 ? (
        <div className="w-[16.25rem] max-w-[16.25rem]">{filters}</div>
      ) : undefined}
      <div className="flex flex-col gap-4 py-10">
        {/* {bannerElement} */}
        {paginationHeader}
        {productCards}
        <Pagination
          withEdges
          className="pt-12"
          color="dark"
          disabled={isFetching || isLoading}
          getControlProps={getControlProps}
          getItemProps={getItemProps}
          position="center"
          total={data?.totalNumberOfPages || 0}
          value={active}
          onChange={onPageChange}
        />
      </div>
    </div>
  )
}
