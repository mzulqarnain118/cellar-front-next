import { ProductsSchema } from '@/lib/types/schemas/product'
import { useEffect, useState } from 'react'

export const useGetAllProducts = () => {
  const [products, setProducts] = useState<ProductsSchema[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/all`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const { data } = (await response.json()) as { data: ProductsSchema[] }
        if (data?.length) {
          setProducts(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}

export default useGetAllProducts
