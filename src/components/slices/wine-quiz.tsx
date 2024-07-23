import { useCallback, useEffect, useMemo, useState } from 'react'

import { useEventListener } from 'usehooks-ts'

import { CORPORATE_CONSULTANT_ID } from '@/lib/constants'
import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
import { useAgeVerified } from '@/lib/hooks/use-age-verified'
import { useWineQuiz } from '@/lib/hooks/use-wine-quiz'
import { useAddToCartMutation } from '@/lib/mutations/cart/add-to-cart'
import { useCartQuery } from '@/lib/queries/cart'
import { useConsultantQuery } from '@/lib/queries/consultant'
import { useProductsQuery } from '@/lib/queries/products'
import { useProcessStore } from '@/lib/stores/process'

type Category =
  | 'Wine: Gift Sets'
  | 'Wine: Wine Clubs'
  | 'Wine: Circle Exclusives'
  | 'Wine: Cans'
  | 'Wine: Sparkling'
  | 'Wine: Rosé'
  | 'Wine: Red'
  | 'Wine: White'
  | 'Merch: Wearables'
  | 'Merch: Drinkware'
  | 'Wine'

export const getProductCategory = (displayCategoriesIds: number[], isGift = false): Category => {
  if (isGift) {
    return 'Wine: Gift Sets'
  } else if (displayCategoriesIds.includes(5)) {
    return 'Wine: Wine Clubs'
  } else if (displayCategoriesIds.includes(33)) {
    return 'Wine: Circle Exclusives'
  } else if (displayCategoriesIds.includes(36)) {
    return 'Wine: Cans'
  } else if (displayCategoriesIds.includes(27)) {
    return 'Wine: Sparkling'
  } else if (displayCategoriesIds.includes(28)) {
    return 'Wine: Rosé'
  } else if (displayCategoriesIds.includes(2)) {
    return 'Wine: Red'
  } else if (displayCategoriesIds.includes(3)) {
    return 'Wine: White'
  } else if (displayCategoriesIds.includes(22)) {
    return 'Merch: Wearables'
  } else if (displayCategoriesIds.includes(23)) {
    return 'Merch: Drinkware'
  }

  return 'Wine'
}

export const WineQuiz = () => {
  const [isLoadingData, setIsLoading] = useState(true)
  const [sku, setSku] = useWineQuiz()
  const { mutate: addToCart } = useAddToCartMutation()
  const { data: consultant } = useConsultantQuery()
  const { data: cart } = useCartQuery()
  const { toggleCartOpen } = useProcessStore()
  const url = useMemo(
    () => (consultant?.displayId !== CORPORATE_CONSULTANT_ID ? consultant.url : undefined),
    [consultant?.displayId, consultant.url]
  )
  const { data: products, isLoading } = useProductsQuery()

  const productData = products?.find(product => product.sku === sku?.toLowerCase())
  const { ageVerified, setAgeVerified } = useAgeVerified()

  const handleStorageChange = useCallback(async () => {
    const isClubOnly =
      productData?.displayCategories?.includes(DISPLAY_CATEGORY['Circle Exclusives']) || false
    const isGift = productData?.displayCategories?.includes(DISPLAY_CATEGORY['Gift Sets']) || false
    const isGiftCard =
      productData?.displayCategories?.includes(DISPLAY_CATEGORY['Gift Cards']) || false
    const isScoutCircleClub =
      productData?.displayCategories?.includes(DISPLAY_CATEGORY['Scout Circle']) || false
    const isAutoSip =
      productData?.displayCategories?.includes(DISPLAY_CATEGORY['Auto-Sip']) || false
    // const isMerch = productData?.catalogId === 9 // merch catalog id

    let tastrySku: string | undefined = sku
    if (tastrySku === undefined && typeof window !== 'undefined') {
      const storageSku = JSON.parse(sessionStorage.getItem('tastry-sku') || '{}')
      tastrySku = storageSku !== undefined && typeof storageSku === 'string' ? storageSku : sku
    }

    if (tastrySku !== undefined) {
      toggleCartOpen()
      cart?.id &&
        addToCart({
          fetchSubtotal: false,
          item: {
            ...productData,
            availability:
              (productData?.availability !== undefined &&
                productData.availability?.map(state => ({
                  abbreviation: state?.abbreviation || 'TX',
                  enabled: state?.enabled || false,
                  name: state?.name || 'Texas',
                  provinceId: state?.provinceId || 48,
                }))) ||
              [],
            cartUrl: productData?.cartUrl || '',
            catalogId: 0,
            categoryName: productData?.displayCategories
              ? getProductCategory(productData?.displayCategories as number[], isGift)
              : undefined,
            displayCategories: productData?.displayCategories || [],
            displayName: productData?.displayName || '',
            isAutoSip,
            isClubOnly,
            isGift,
            isGiftCard,
            // isMerch: false,
            isScoutCircleClub,
            isVip: false,
            price: productData?.price || 0,
            quantityAvailable: productData?.quantityAvailable || 0,
            sku: tastrySku,
            subscribable: productData?.subscribable || false,
          },
          quantity: 1,
          wineQuiz: true,
        })
    }
  }, [addToCart, productData, sku, toggleCartOpen])

  useEventListener('storage', handleStorageChange)

  useEffect(() => {
    setTimeout(() => {
      setSku(sku)
      const tastryEvent = new Event('loadTastry')
      window.dispatchEvent(tastryEvent)
      setIsLoading(false)
    }, 1000)
  }, [setSku, sku, products, productData, ageVerified])

  if (isLoading || isLoadingData) {
    return (
      <div className="mx-auto flex h-[40rem] max-w-2xl flex-col items-center py-4 px-16 md:px-0">
        <div className="h-8 w-56 animate-pulse rounded bg-[#864f4f]" />
        <div className="mt-12 mb-4 h-10 w-full animate-pulse rounded bg-[#864f4f]" />
        <div className="h-14 w-full animate-pulse rounded bg-[#864f4f]" />
        <div className="mt-8 mb-10 flex gap-2">
          <div className="h-52 w-40 animate-pulse rounded bg-[#864f4f]" />
          <div className="h-52 w-40 animate-pulse rounded bg-[#864f4f]" />
          <div className="hidden h-52 w-40 animate-pulse rounded bg-[#864f4f] md:block" />
        </div>
        <div className="mb-2 h-14 w-52 animate-pulse rounded bg-[#864f4f]" />
        <div className="my-2 h-14 w-52 animate-pulse rounded bg-[#864f4f]" />
      </div>
    )
  }

  return (
    <div
      className="mx-auto min-h-[40rem] py-4"
      data-consultant={url}
      data-location={process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true' ? 'Online' : 'Testing'}
      data-shadow="true"
      data-tenant={process.env.NEXT_PUBLIC_TASTRY_TENANT}
      id="tastry-inline-app"
    />
  )
}
