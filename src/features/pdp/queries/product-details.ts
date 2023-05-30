import { QueryFunction, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { useCartQuery } from '@/lib/queries/cart'

import { GetProductDetailsPDPResponse, ProductDetails } from '../types'

export const getProductDetails: QueryFunction<ProductDetails | null, string[]> = async ({
  queryKey,
}) => {
  try {
    const cartId = queryKey[1]
    const sku = queryKey[2]
    const response = await api('v2/GetProductDetails', {
      method: 'get',
      searchParams: { bypass: 1, cartId, sku },
    }).json<GetProductDetailsPDPResponse>()

    if (response.Success) {
      return response.Data
    }

    return null
  } catch {
    //
    return null
  }
}

export const PRODUCT_DETAILS_QUERY_KEY = 'product-details'

export const useProductDetails = (sku?: string) => {
  const { data: cart } = useCartQuery()

  return useQuery({
    enabled: !!sku,
    queryFn: getProductDetails,
    queryKey: [PRODUCT_DETAILS_QUERY_KEY, cart?.id || '', sku || ''],
  })
}
