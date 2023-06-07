import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { Pagination, PaginationProps, Select, SelectProps } from '@mantine/core'
import { useWindowScroll } from '@mantine/hooks'
import { Content, FilledContentRelationshipField } from '@prismicio/client'
import { clsx } from 'clsx'

import { Button } from '@/core/components/button'
import { Skeleton } from '@/core/components/skeleton'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { usePaginatedSearch } from '@/features/search/queries'
import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
import { usePaginatedProducts } from '@/lib/queries/products'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ProductCard } from '../product-card'

import { FilterBar } from './filter/filter-bar'
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
  categories?: number[]
  enabledFilters?: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>[]
  page?: number
  limit?: number
  search?: string
  sort?: Sort
}

export const ProductListing = ({
  categories = [],
  enabledFilters = [],
  page: initialPage = 1,
  limit = 16,
  search = '',
  sort: initialSort = 'relevant',
}: ProductListingProps) => {
  const { consultant } = useConsultantStore()
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const [active, setPage] = useState(initialPage)
  const [sort, setSort] = useState<Sort>(initialSort)

  const [showFilters, setShowFilters] = useState(false)
  const [_, scrollTo] = useWindowScroll()

  const options = useMemo(
    () => ({ categories, limit, page: active, search, sort }),
    [categories, limit, active, search, sort]
  )

  const paginatedProducts = usePaginatedProducts(options, search.length === 0)
  const paginatedSearch = usePaginatedSearch(options, search.length > 0)
  const { data, isError, isFetching, isLoading } = useMemo(
    () => (search.length > 0 ? { ...paginatedSearch } : { ...paginatedProducts }),
    [paginatedProducts, paginatedSearch, search.length]
  )

  const handleFilterClose = useCallback(() => setShowFilters(false), [])

  const filters = useMemo(() => {
    if (isLoading) {
      return <div className="lg:min-w-[15rem] animate-pulse bg-neutral-light rounded" />
    }

    return (
      <Filters enabledFilters={enabledFilters} show={showFilters} onClose={handleFilterClose} />
    )
  }, [enabledFilters, handleFilterClose, isLoading, showFilters])

  const onFilterToggle = useCallback(() => setShowFilters(prev => !prev), [])

  const filtersButton = useMemo(
    () =>
      enabledFilters.length > 0 ? (
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
    [enabledFilters.length, onFilterToggle, showFilters]
  )

  const productCards = useMemo(
    () =>
      data?.products !== undefined ? (
        <div
          className={clsx(
            'transition-all lg:grid lg:grid-cols-[auto_auto]',
            showFilters && enabledFilters.length > 0 && 'lg:gap-10'
          )}
        >
          {filters}
          <div
            className={clsx(
              'transition-all grid gap-4 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 3xl:grid-cols-5 relative'
            )}
          >
            {data.products.map((product, index) => (
              <ProductCard key={product.sku} priority={index < 4} product={product} />
            ))}
          </div>
        </div>
      ) : undefined,
    [data?.products, enabledFilters.length, filters, showFilters]
  )

  const onSortChange = useCallback((value: Sort) => {
    setSort(value)
    setPage(1)
  }, [])

  const paginationHeader = useMemo(
    () => (
      <>
        {isFetching || isLoading ? (
          <div className="h-6 w-60 animate-pulse rounded bg-neutral-300" />
        ) : (
          <Typography>
            Showing {search.length > 0 ? `search results for "${search}": ` : undefined}
            {data?.resultsShown?.[0]}-{data?.resultsShown?.[1]} results of {data?.results}.
          </Typography>
        )}
        {isDesktop ? (
          <div
            className={clsx(
              'lg:grid lg:grid-cols-[auto_1fr] items-end justify-between',
              showFilters && enabledFilters.length > 0 && 'lg:gap-10',
              enabledFilters.length === 0 && 'lg:!grid-cols-1'
            )}
          >
            {filtersButton}
            <div className="grid grid-cols-2 items-end gap-4 sticky top-4 left-0 lg:gap-0 lg:grid-cols-[1fr_auto] justify-between w-full">
              <FilterBar />
              {isDesktop ? undefined : filtersButton}
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
        ) : (
          <div
            className={clsx(
              'lg:grid lg:grid-cols-[auto_1fr] items-end justify-between',
              showFilters && 'lg:gap-10',
              enabledFilters.length === 0 && 'grid-cols-1'
            )}
          >
            <div className="grid grid-cols-2 items-end gap-4 sticky top-4 left-0 lg:gap-0 lg:grid-cols-[1fr_auto] justify-between w-full">
              <FilterBar />
              {filtersButton}
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
      enabledFilters.length,
      filtersButton,
      isDesktop,
      isFetching,
      isLoading,
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

  useEffect(() => {
    if (isDesktop) {
      setShowFilters(true)
    }
  }, [isDesktop])

  if (isFetching || isLoading) {
    return (
      <div className="grid gap-4 lg:flex lg:flex-col">
        {paginationHeader}
        <div className="lg:grid lg:grid-cols-[auto_1fr] lg:gap-10">
          {filters}
          <div className="grid grid-cols-1 gap-4 lg:auto-rows-auto lg:grid-cols-4 lg:gap-6">
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
            <Skeleton className="h-[30.25rem]" />
          </div>
        </div>
        <div className="mx-auto mt-6 flex items-center justify-center">
          <div className="h-[3rem] w-[2.5rem] animate-pulse rounded bg-neutral-300" />
          <div className="h-[3rem] w-[5rem] animate-pulse rounded bg-neutral-300" />
          <div className="h-[3rem] w-[2.5rem] animate-pulse rounded bg-neutral-300" />
        </div>
      </div>
    )
  }

  if (isError) {
    // ! TODO: Something bad happened.
  }

  if (!data || data.products.length === 0) {
    // ! TODO: Not found.
    return <>Not found.</>
  }

  return (
    <div className="flex flex-col gap-4">
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
        total={data?.totalNumberOfPages}
        value={active}
        onChange={onPageChange}
      />
    </div>
  )
}
