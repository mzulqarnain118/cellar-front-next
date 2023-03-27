import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

import { usePaginatedProducts } from '@/lib/queries/products'

import { Link } from '../link'
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
  limit,
}: ProductListingProps) => {
  const router = useRouter()
  const [page, setPage] = useState(initialPage)
  const [sort, setSort] = useState<Sort>((router.query.sort?.toString() as Sort) || 'relevant')
  const [showFilters, setShowFilters] = useState(false)

  const options = useMemo(
    () => ({ categories, limit, page, sort }),
    [categories, limit, page, sort]
  )

  const { data, isError, isFetching, isLoading, isPreviousData } = usePaginatedProducts(options)

  // const updateRouter = useCallback(
  //   () => router.push(`${router.pathname}?page=${page}&sort=${sort}`, undefined, { shallow: true }),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [page, sort]
  // )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }

    // updateRouter()
  }, [page])

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

  const handlePreviousPageClick = useCallback(() => {
    let newPage = 0
    setPage(prev => {
      newPage = Math.max(prev - 1, 0)
      return newPage
    })

    // updateRouter()
  }, [setPage])

  const handleNextPageClick = useCallback(() => {
    if (!!data?.totalNumberOfPages && !isPreviousData && page <= data.totalNumberOfPages) {
      let newPage = 0
      setPage(prev => {
        newPage = prev + 1
        return newPage
      })

      // updateRouter()
    }
  }, [data?.totalNumberOfPages, isPreviousData, page])

  const nextPageHref = useMemo(
    () => ({
      pathname: router.pathname,
      // search: `?categories=16&limit=16&page=${page + 1}&sort=${sort}`,
      query: {
        categories: '16',
        limit: '16',
        page: page + 1,
        sort,
      },
    }),
    [page, router.pathname, sort]
  )

  const paginationFooter = useMemo(
    () => (
      <div className="btn-group mx-auto mt-8">
        <button
          aria-label="Previous Page"
          className="btn-ghost btn"
          disabled={page === 1}
          onClick={handlePreviousPageClick}
        >
          «
        </button>
        <button className="btn-ghost btn">Page {page}</button>
        <button
          aria-label="Next Page"
          className="btn-ghost btn"
          disabled={
            isPreviousData || (!!data?.totalNumberOfPages && page >= data.totalNumberOfPages)
          }
          onClick={handleNextPageClick}
        >
          »
        </button>
        <Link href={nextPageHref}>»</Link>
      </div>
    ),
    [
      data?.totalNumberOfPages,
      handleNextPageClick,
      handlePreviousPageClick,
      isPreviousData,
      nextPageHref,
      page,
    ]
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
            <AdjustmentsHorizontalIcon className="h-8 w-8 transition-transform group-hover:rotate-90" />
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
    [data?.results, data?.resultsShown, showFilters, sort]
  )

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
      {paginationFooter}
    </div>
  )
}
