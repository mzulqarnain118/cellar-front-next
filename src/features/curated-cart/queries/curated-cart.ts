import { QueryFunction, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/api'
import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useCuratedCartStore } from '@/lib/stores/curated-cart'

export interface CuratedCartData {
  OrderID?: number
  OrderDisplayID?: string
  OrderDate?: string
  CartID?: string
  OrderOwnerDisplayID?: string
  OrderOwnerUsername?: string
  OrderStatusID?: number
  ShoppingCartID?: number
  RecommendedByPersonID?: number
  RecommendedByPersonDisplayID?: string
  RecommendationNote?: string
  messageDismissed?: boolean
  cartAccepted?: boolean
}

export interface GetCuratedCartResponse {
  result: boolean
  data?: {
    OrderID: number
    OrderStatusID: number
    ShoppingCartID: number
    RecommendedByPersonID: number
    RecommendedByPersonDisplayID: string
    RecommendationNote: string
    OrderDisplayID: string
    OrderDate: string
    CartID: string
    OrderOwnerDisplayID: string
    OrderOwnerUsername: string
  }
}

export const getCuratedCart: QueryFunction<
  GetCuratedCartResponse['data'] | null,
  (string | undefined)[]
> = async ({ queryKey }) => {
  try {
    const customerDisplayId = queryKey[1]
    const consultantDisplayId = queryKey[2]

    if (customerDisplayId === undefined || consultantDisplayId === undefined) {
      return null
    }

    const response = await api('orders/getcustomerordersforwebsite', {
      json: {
        ConsultantDisplayID: consultantDisplayId,
        CustomerDisplayID: customerDisplayId,
      },
      method: 'post',
    }).json<GetCuratedCartResponse>()

    if (response.result) {
      return response.data
    }
    return null
  } catch {
    return null
  }
}

export const CURATED_CART_QUERY_KEY = 'curated-cart'
export const useCuratedCartQuery = () => {
  const { data: session } = useSession()
  const { data: consultant } = useConsultantQuery()
  const { curatedCart, setCuratedCart } = useCuratedCartStore()

  return useQuery({
    enabled:
      curatedCart === undefined || (curatedCart !== undefined && !curatedCart.messageDismissed),
    onSettled: data => {
      if (data !== undefined) {
        setCuratedCart({
          cartAccepted: false,
          cartId: data?.CartID || '',
          messageDismissed: false,
          recommendedByPersonDisplayId: data?.RecommendedByPersonDisplayID || '',
        })
      } else {
        setCuratedCart(undefined)
      }
    },
    queryFn: getCuratedCart,
    queryKey: [
      CURATED_CART_QUERY_KEY,
      session?.user?.displayId,
      consultant?.displayId !== CORPORATE_CONSULTANT_ID ? consultant?.displayId : undefined,
    ],
  })
}
