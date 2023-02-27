import { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { usePaginatedProducts } from '@/lib/queries/products'

import { Rating } from '../rating'

interface ProductListingProps {
  categories?: number[]
  page?: number
  limit?: number
}

export const ProductListing = ({
  categories = [],
  page: initialPage = 1,
  limit,
}: ProductListingProps) => {
  const [page, setPage] = useState(initialPage)
  const router = useRouter()

  const { data, isError, isFetching, isLoading, isPreviousData } = usePaginatedProducts({
    categories,
    limit,
    page,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [page])

  const productCards = useMemo(
    () =>
      data?.products.map((product, index) => (
        <div
          key={product.sku}
          className={`
            relative grid grid-cols-3 rounded-lg p-4 shadow lg:grid-cols-none
            lg:grid-rows-[19rem_1fr_auto] lg:p-6
          `}
        >
          {product.badges !== undefined && (
            <div className="absolute top-4 left-4 flex flex-col space-y-1 lg:space-y-2">
              {product.badges.map(badge => (
                <div
                  key={badge.name}
                  className="tooltip cursor-pointer capitalize"
                  data-tip={badge.name}
                >
                  <Image
                    alt={badge.name}
                    className="h-6 w-6 lg:h-8 lg:w-8"
                    height={36}
                    src={badge.imageUrl}
                    width={36}
                  />
                </div>
              ))}
            </div>
          )}
          <figure className="relative block h-full w-[10rem] self-center justify-self-center lg:w-[12rem]">
            {product.pictureUrl !== undefined ? (
              <Link href={`/product/${product.cartUrl}`}>
                <Image
                  fill
                  alt={product.displayName || 'Product'}
                  className="object-contain"
                  priority={index < 4}
                  src={product.pictureUrl}
                />
              </Link>
            ) : (
              // ! TODO: No image available.
              <></>
            )}
          </figure>
          <div className="col-span-2 grid grid-rows-[1fr_auto] lg:col-span-1">
            <div className="card-body gap-0 !p-0">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>{product.attributes?.SubType}</span>
                  <span>{product.attributes?.Origin}</span>
                </div>
                <Link
                  className="card-title text-base font-semibold leading-normal"
                  href={`/product/${product.cartUrl}`}
                >
                  {product.displayName}
                </Link>
                <Rating className="mt-2" rating={Math.floor(Math.random() * 5) + 1} />
              </div>
            </div>
            <div className="card-actions justify-between lg:mt-6">
              <div className="flex">
                {product.attributes?.['Tasting Notes'] ? (
                  product.attributes?.['Tasting Notes'].slice(0, 3).map(item => (
                    <div
                      key={item.name}
                      className="tooltip cursor-pointer capitalize"
                      data-tip={item.name.replaceAll('-', ' ')}
                    >
                      <Image alt={item.name} height={32} src={item.imageUrl} width={32} />
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div>
              <button className="btn-primary btn-sm btn lg:btn-md">Add to Cart</button>
            </div>
          </div>
        </div>
      )),
    [data?.products]
  )

  const handlePreviousPageClick = useCallback(() => {
    let newPage = 0
    setPage(prev => {
      newPage = Math.max(prev - 1, 0)
      return newPage
    })

    router.push(`${router.pathname}?page=${newPage}`, undefined, { shallow: true })
  }, [router, setPage])

  const handleNextPageClick = useCallback(() => {
    if (!!data?.totalNumberOfPages && !isPreviousData && page <= data.totalNumberOfPages) {
      let newPage = 0
      setPage(prev => {
        newPage = prev + 1
        return newPage
      })

      router.push(`${router.pathname}?page=${newPage}`, undefined, { shallow: true })
    }
  }, [data?.totalNumberOfPages, isPreviousData, page, router])

  const paginationFooter = useMemo(
    () => (
      <div className="btn-group mx-auto mt-8">
        <button
          aria-label="Previous Page"
          className="btn btn-ghost"
          disabled={page === 1}
          onClick={handlePreviousPageClick}
        >
          «
        </button>
        <button className="btn btn-ghost">Page {page}</button>
        <button
          aria-label="Next Page"
          className="btn btn-ghost"
          disabled={
            isPreviousData || (!!data?.totalNumberOfPages && page >= data.totalNumberOfPages)
          }
          onClick={handleNextPageClick}
        >
          »
        </button>
      </div>
    ),
    [data?.totalNumberOfPages, handleNextPageClick, handlePreviousPageClick, isPreviousData, page]
  )

  const paginationHeader = useMemo(
    () => (
      <div className="flex items-center justify-between">
        <span>
          Showing {data?.resultsShown?.[0]}-{data?.resultsShown?.[1]} results of {data?.results}.
        </span>
        <label className="" htmlFor="sort">
          Sort by:
          <select className="select-bordered select w-full max-w-xs" id="sort" name="sort">
            <option>Most relevant</option>
            <option>Newest</option>
            <option>Price (low to high)</option>
            <option>Price (high to low)</option>
          </select>
        </label>
      </div>
    ),
    [data?.results, data?.resultsShown]
  )

  if (isFetching || isLoading) {
    return (
      <>
        <div className="flex items-center justify-between">
          <div className="mb-4 h-6 w-60 animate-pulse rounded-lg bg-neutral-300" />
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
      <div className="grid grid-cols-1 gap-4 md:auto-rows-auto md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {productCards}
      </div>
      {paginationFooter}
    </div>
  )
}
