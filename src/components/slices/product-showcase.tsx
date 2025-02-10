import { CSSProperties, useEffect, useState } from 'react'

import { Skeleton } from '@mantine/core'
import type { Content } from '@prismicio/client'
import { PrismicRichText, SliceComponentProps } from '@prismicio/react'

import useGetAllProducts from '@/core/hooks/use-get-all-products'
import { ProductCard } from '../product-card'

type ProductShowcaseProps =
    SliceComponentProps<Content.RichContentPageDocumentDataBodyProductShowcaseSlice>

type Product = {
    displayName: string;
    price: number;
    pictureUrl: string;
    cartUrl: string;
    sku: string;
    ctaLink: string;
    ctaText: string;
};

export const ProductShowcase = ({
    excludedSku = '',
    slice,
}: ProductShowcaseProps & { excludedSku?: string }) => {
    const { products: allProducts, loading } = useGetAllProducts();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (allProducts?.length) {
            const filterProducts: Product[] = slice.items
                .map((item) => {
                    return {
                        ...item,
                        ...(allProducts?.find(
                            (product) =>
                                product?.sku?.toLowerCase() === item?.product?.uid?.toLowerCase()
                        ) || {})
                    }
                }
                )
                ?.filter((item) => item?.image?.url || item?.pictureUrl)
                ?.map((item) => ({
                    displayName: item?.title?.[0]?.text || item?.displayName || '',
                    price: item?.price?.[0]?.text || item?.price || 0,
                    pictureUrl: item?.image?.url || item?.pictureUrl || '',
                    cartUrl: item?.cartUrl || '',
                    sku: item?.sku ?? '',
                    ctaLink: item?.cta_link?.[0]?.text || item?.cartUrl || '',
                    ctaText: item?.cta_text?.[0]?.text ?? '',
                }));

            setProducts([...filterProducts]);
        }
    }, [allProducts?.length, slice]);
    if (!products?.length) {
        return (
            <div className="flex w-full gap-8">
                <Skeleton className="my-8 h-[640px] !w-1/4" />
                <Skeleton className="my-8 h-[640px] !w-1/4" />
                <Skeleton className="my-8 h-[640px] !w-1/4" />
                <Skeleton className="my-8 h-[640px] !w-1/4" />
            </div>
        )
    }
    if (products === undefined || products.length === 0) {
        return <></>
    }

    return (
        <div className="py-8 lg:mx-auto container">
            <div
                className="px-4 text-center"
                style={{ '--highlight': slice.primary.highlight_color } as CSSProperties}
            >
                <PrismicRichText field={slice.primary.heading} />
            </div>
            {/* <Carousel withControls withIndicators align="start" slideGap="lg" slideSize="25%"> */}
            <div className="flex flex-wrap gap-16 justify-center py-8">
                {products?.map(product => (
                    <div key={product.sku}>
                        <ProductCard
                            className="h-[500px] !w-[350px] bg-white"
                            prismicColor={slice.primary.highlight_color}
                            product={product}
                        />
                    </div>
                ))}
            </div>
            {/* </Carousel> */}
        </div>
    )
}
