import { useCallback, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { Pagination, PaginationProps } from '@mantine/core'

import { usePaginatedProducts } from '@/lib/queries/products'
import { useConsultantStore } from '@/lib/stores/consultant'

import { ProductCard } from '../product-card'

interface ProductListingProps {
  categories?: number[]
  page?: number
  limit?: number
}

type Sort = 'relevant' | 'price-low-high' | 'price-high-low'

export const ProductListing = ({
  categories = [],
  page: initialPage = 1,
  limit = 16,
}: ProductListingProps) => {
  const { consultant } = useConsultantStore()
  const router = useRouter()
  const [active, setPage] = useState(initialPage)
  const [sort, setSort] = useState<Sort>((router.query.sort?.toString() as Sort) || 'relevant')
  const [showFilters, setShowFilters] = useState(false)

  const options = useMemo(
    () => ({ categories, limit, page: active, sort }),
    [categories, limit, active, sort]
  )

  const { data, isError, isFetching, isLoading } = usePaginatedProducts(options)

  const productCards = useMemo(
    () =>
      data?.products !== undefined ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((product, index) => (
            <ProductCard key={product.sku} priority={index < 4} product={product} />
          ))}
        </div>
      ) : undefined,
    [data?.products]
  )

  const paginationHeader = useMemo(
    () => (
      <>
        <span>
          Showing {data?.resultsShown?.[0]}-{data?.resultsShown?.[1]} results of {data?.results}.
        </span>
        <div className="flex items-center justify-between">
          <button
            className="group btn-ghost btn flex items-center gap-2"
            onClick={() => setShowFilters(prev => !prev)}
          >
            <AdjustmentsHorizontalIcon
              className={`h-8 w-8 transition-transform group-hover:rotate-90`}
            />
            <span className="hidden lg:block">{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
          <label aria-label="Sort by" htmlFor="sort">
            <span className="hidden lg:block">Sort by:</span>
            <select
              className="select-bordered select max-w-xs lg:w-full"
              id="sort"
              name="sort"
              value={sort}
              onChange={event => {
                const newValue = event.target.value as Sort
                setSort(newValue)
                setPage(1)
              }}
            >
              <option value="relevant">Most relevant</option>
              <option value="price-low-high">Price (low to high)</option>
              <option value="price-high-low">Price (high to low)</option>
            </select>
          </label>
        </div>
      </>
    ),
    [data?.results, data?.resultsShown, setPage, showFilters, sort]
  )

  const getControlProps: PaginationProps['getControlProps'] = useCallback(
    (control: 'first' | 'previous' | 'last' | 'next') => {
      if (control === 'first') {
        return {
          component: Link,
          href: `${
            router.pathname
          }?categories=${categories.toString()}&limit=${limit}&page=1&sort=${sort}${
            consultant.url ? `&u=${consultant.url}` : ''
          }`,
          scroll: true,
          shallow: true,
        }
      }

      if (control === 'last') {
        return {
          component: Link,
          href: `${router.pathname}?categories=${categories.toString()}&limit=${limit}&page=${
            data?.totalNumberOfPages
          }&sort=${sort}${consultant.url ? `&u=${consultant.url}` : ''}`,
          scroll: true,
          shallow: true,
        }
      }

      if (control === 'next') {
        return {
          component: Link,
          href: `${router.pathname}?categories=${categories.toString()}&limit=${limit}&page=${
            active === data?.totalNumberOfPages ? active : active + 1
          }&sort=${sort}${consultant.url ? `&u=${consultant.url}` : ''}`,
          scroll: true,
          shallow: true,
        }
      }

      if (control === 'previous') {
        return {
          component: Link,
          href: `${router.pathname}?categories=${categories.toString()}&limit=${limit}&page=${
            active === 1 ? 1 : active - 1
          }&sort=${sort}${consultant.url ? `&u=${consultant.url}` : ''}`,
          scroll: true,
          shallow: true,
        }
      }

      return {}
    },
    [active, categories, consultant.url, data?.totalNumberOfPages, limit, router.pathname, sort]
  )

  const getItemProps: PaginationProps['getItemProps'] = useCallback(
    (page: number) => ({
      component: Link,
      href: `${
        router.pathname
      }?categories=${categories.toString()}&limit=${limit}&page=${page}&sort=${sort}${
        consultant.url ? `&u=${consultant.url}` : ''
      }`,
      scroll: true,
      shallow: true,
    }),
    [categories, consultant.url, limit, router.pathname, sort]
  )

  const onPageChange = useCallback((page: number) => {
    document.querySelector('#root-element')?.scrollTo({ behavior: 'smooth', left: 0, top: 0 })
    setPage(page)
  }, [])

  if (isFetching || isLoading) {
    return (
      <>
        <div className="mb-4 h-6 w-60 animate-pulse rounded-lg bg-neutral-300" />
        <div className="flex items-center justify-between">
          <div className="h-12 w-[14.5rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="grid gap-2">
            <div className="h-6 w-[14.5rem] animate-pulse rounded-lg bg-neutral-300" />
            <div className="mb-4 h-12 w-[14.5rem] animate-pulse rounded-lg bg-neutral-300" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:auto-rows-auto lg:grid-cols-4 lg:gap-6">
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[31rem] animate-pulse rounded-lg bg-neutral-300" />
        </div>
        <div className="mx-auto mt-6 flex items-center justify-center">
          <div className="h-[3rem] w-[2.5rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[3rem] w-[5rem] animate-pulse rounded-lg bg-neutral-300" />
          <div className="h-[3rem] w-[2.5rem] animate-pulse rounded-lg bg-neutral-300" />
        </div>
      </>
    )
  }

  if (isError) {
    // ! TODO: Something bad happened.
  }

  if (!data) {
    // ! TODO: Not found.
    return <>Not found.</>
  }

  return (
    <div className="flex flex-col gap-4">
      {paginationHeader}
      {productCards}
      <Pagination
        withEdges
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
