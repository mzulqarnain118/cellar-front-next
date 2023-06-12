import { Client, Content } from '@prismicio/client'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/prismic-io'

export const getCartPromoMessages = async (client?: Client<Content.AllDocumentTypes>) => {
  try {
    const prismicClient = client || createClient()
    const data = await prismicClient.getSingle('cart_promo_msgs')

    return data
  } catch {
    return undefined
  }
}

export const CART_PROMO_MESSAGES_QUERY_KEY = 'cart-promo-messages'

export const useCartPromoMessagesQuery = () =>
  useQuery({
    cacheTime: 15 * (60 * 1000),
    queryFn: () => getCartPromoMessages(),
    queryKey: [CART_PROMO_MESSAGES_QUERY_KEY],
    staleTime: 10 * (60 * 1000),
  })
