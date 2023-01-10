import { EyeIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import Link from 'next/link'

import { useAddToCartMutation } from '@/lib/mutations/add-to-cart'
import { Product } from '@/lib/types'
import { convertProductToCartItem } from '@/lib/utils'

import { Price } from '../price'

interface ProductCardProps {
  priority?: boolean
  product: Product
}

export const ProductCard = ({ priority = false, product }: ProductCardProps) => {
  const { mutate: addToCart } = useAddToCartMutation()

  return (
    <div
      key={product.sku}
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
      <button
        aria-label="Quick View"
        className={`
          relative bottom-8 flex items-center gap-1 rounded-lg border border-primary-500
          bg-primary-500 py-1 px-2 text-sm text-neutral-50 opacity-0 transition
          hover:bg-primary-400 group-hover:opacity-80
        `}
        title="Quick View"
        type="button"
      >
        <EyeIcon height={16} width={16} />
        Quick View
      </button>
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
              h-10 w-full rounded bg-primary-500 py-1 text-neutral-50
              transition-colors hover:bg-primary-400
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
