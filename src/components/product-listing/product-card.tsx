import Image from 'next/image'
import Link from 'next/link'

import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { Product } from '@/lib/types'
import { convertProductToCartItem } from '@/lib/utils/index'

import { Price } from '../price'

interface ProductCardProps {
  /** Indicates if the product image should load eagarly. Defaults to false. */
  priority?: boolean
  product: Product
}

export const ProductCard = ({ priority = false, product }: ProductCardProps) => {
  const { mutate: addToCart } = useAddToCartMutation()

  return (
    <div
      className={`
        group relative grid w-full grid-rows-product-card items-center
        justify-items-center rounded-lg border-2 border-neutral-100 p-4
        transition-shadow hover:shadow-lg
      `}
    >
      {product.pictureUrl && (
        <Link href="/">
          <Image
            alt={product.displayName || 'Product'}
            className="h-auto w-[180px]"
            height={0}
            priority={priority}
            sizes="100vw"
            src={product.pictureUrl}
            width={0}
          />
        </Link>
      )}
      <div className="flex h-full w-full flex-col justify-between gap-6 self-end">
        <Link className="group/link flex flex-col" href="/">
          <span className="text-sm font-semibold">
            {product.attributes?.find(attribute => attribute.name === 'Brand')?.value}
          </span>
          <span className="group-hover/link:underline">{product.displayName}</span>
        </Link>
        <div className="space-y-2">
          {product.price && (
            <Price price={product.price} onSalePrice={parseInt(product.comparePrice || '0')} />
          )}
          <button
            className={`
              h-10 w-full rounded bg-[#337250] py-1 text-[#F2F2F2] transition-colors
              hover:bg-[#26563C] active:bg-[#152F21] active:underline disabled:bg-brand-300
            `}
            type="button"
            onClick={() =>
              addToCart({
                item: convertProductToCartItem(product),
              })
            }
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
