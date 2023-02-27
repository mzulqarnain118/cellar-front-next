import { useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { ProductsSchema } from '@/lib/types/schemas/product'

import { Rating } from '../rating'

interface ProductCardProps {
  priority?: boolean
  product: ProductsSchema
}

export const ProductCard = ({ priority = false, product }: ProductCardProps) => {
  const badges = useMemo(
    () =>
      product.badges !== undefined && (
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
      ),
    [product.badges]
  )

  const tastingNotes = useMemo(
    () =>
      product.attributes?.['Tasting Notes']?.slice(0, 3).map(item => (
        <div
          key={item.name}
          className="tooltip cursor-pointer capitalize"
          data-tip={item.name.replaceAll('-', ' ')}
        >
          <Image alt={item.name} height={32} src={item.imageUrl} width={32} />
        </div>
      )),
    [product.attributes]
  )

  return (
    <div
      className={`
        relative grid grid-cols-3 rounded-lg p-4 shadow lg:grid-cols-none
        lg:grid-rows-[19rem_1fr_auto] lg:p-6
      `}
    >
      {badges}
      <figure className="relative block h-full w-[10rem] self-center justify-self-center lg:w-[12rem]">
        {product.pictureUrl !== undefined ? (
          <Link href={`/product/${product.cartUrl}`}>
            <Image
              alt={product.displayName || 'Product'}
              className="object-contain"
              height={304}
              priority={priority}
              src={product.pictureUrl}
              width={192}
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
            <div className="flex items-center justify-between text-sm text-neutral-500">
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
          <div className="flex">{tastingNotes}</div>
          <button className="btn-primary btn-sm btn lg:btn-md">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
