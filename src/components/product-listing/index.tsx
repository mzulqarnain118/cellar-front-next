import { useCallback, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { usePaginatedProducts } from '@/lib/queries/products'

interface ProductListingProps {
  categories?: number[]
  page?: number
  limit?: number
}

export const ProductListing = ({
  categories = [],
  page: initialPage = 1,
  limit = 10,
}: ProductListingProps) => {
  const [page, setPage] = useState(initialPage)
  const router = useRouter()

  const { data, isError, isFetching, isLoading, isPreviousData } = usePaginatedProducts({
    categories,
    limit,
    page,
  })

  const productCards = useMemo(
    () =>
      data?.products.map(product => (
        <div
          key={product.sku}
          className={`
            relative grid grid-cols-3 rounded-lg p-4 shadow lg:grid-cols-none
            lg:grid-rows-[19rem_1fr_auto] lg:p-6
          `}
        >
          {product.badges !== undefined && (
            <div className="absolute top-4 left-4 flex gap-2">
              {product.badges.map(badge => (
                <div key={badge.name}>
                  <Image alt={badge.name} height={36} src={badge.imageUrl} width={36} />
                </div>
              ))}
            </div>
          )}
          <figure className="self-center justify-self-center">
            {product.pictureUrl !== undefined ? (
              <Link href={`/product/${product.cartUrl}`}>
                <Image
                  alt={product.displayName || 'Product'}
                  className="h-auto w-[10rem] lg:w-[12rem]"
                  height={0}
                  sizes="100vw"
                  src={product.pictureUrl}
                  width={0}
                />
              </Link>
            ) : (
              // ! TODO: No image available.
              <></>
            )}
          </figure>
          <div className="col-span-2 grid grid-rows-[1fr_auto] lg:col-span-1">
            <div className="card-body gap-0 !p-0">
              <span>{product.attributes?.SubType}</span>
              <Link
                className="card-title text-base font-semibold leading-normal"
                href={`/product/${product.cartUrl}`}
              >
                {product.displayName}
              </Link>
            </div>
            <div className="card-actions justify-end lg:mt-6">
              <button className="btn-sm btn lg:btn-md">Add to Cart</button>
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ behavior: 'smooth', top: 0 })
    }

    router.push(`wine?page=${newPage}&limit=${limit}`, undefined, { shallow: true })
  }, [limit, router, setPage])

  const handleNextPageClick = useCallback(() => {
    if (!!data?.totalNumberOfPages && !isPreviousData && page <= data.totalNumberOfPages) {
      let newPage = 0
      setPage(prev => {
        newPage = prev + 1
        return newPage
      })
      if (typeof window !== 'undefined') {
        window.scrollTo({ behavior: 'smooth', top: 0 })
      }

      router.push(`wine?page=${newPage}&limit=${limit}`, undefined, { shallow: true })
    }
  }, [data?.totalNumberOfPages, isPreviousData, limit, page, router])

  const paginationFooter = useMemo(
    () => (
      <div className="btn-group mx-auto">
        <button className="btn" disabled={page === 1} onClick={handlePreviousPageClick}>
          «
        </button>
        <button className="btn">Page {page}</button>
        <button
          className="btn"
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
      <span>
        Showing {data?.resultsShown?.[0]}-{data?.resultsShown?.[1]} results of {data?.results}.
      </span>
    ),
    [data?.results, data?.resultsShown]
  )

  if (isLoading) {
    // ! TODO: Loading skeleton.
    return <>Loading...</>
  }

  if (isError) {
    // ! TODO: Something bad happened.
  }

  // if (!data) {
  //   // ! TODO: Not found.
  //   return <>Not found.</>
  // }

  return (
    <div className="flex flex-col gap-4">
      {paginationHeader}
      <div className="grid grid-cols-1 gap-4 lg:auto-rows-auto lg:grid-cols-4 lg:gap-6">
        {productCards}
      </div>
      {paginationFooter}
    </div>
  )
}
