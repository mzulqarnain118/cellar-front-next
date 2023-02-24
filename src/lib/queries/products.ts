import { QueryFunction, useQuery } from '@tanstack/react-query'

export const PRODUCTS_QUERY_KEY = ['products']

export const getProducts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`)
  if (response.ok) {
    return await response.json()
  }
}

export const getProductByCartUrl: QueryFunction = async ({ queryKey }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products?cartUrl=${queryKey[1]}`
  )
  if (response.ok) {
    return await response.json()
  }
}

export const useProductsQuery = () =>
  useQuery({
    cacheTime: 20 * (60 * 1000), // 20 minutes.
    queryFn: getProducts,
    queryKey: PRODUCTS_QUERY_KEY,
    staleTime: 10 * (60 * 1000), // 10 minutes.
  })

export const useProductQuery = (cartUrl: string) =>
  useQuery({
    cacheTime: 20 * (60 * 1000), // 20 minutes.
    queryFn: getProductByCartUrl,
    queryKey: [...PRODUCTS_QUERY_KEY, cartUrl],
    staleTime: 10 * (60 * 1000), // 10 minutes.
  })
