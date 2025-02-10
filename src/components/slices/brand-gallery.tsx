'use client'; // Required for using hooks and client-side features in Next.js 13

import { generateGtmBrandClick, generateGtmEventWithData } from '@/lib/utils/google-analytics';
import { procStr } from '@/lib/utils/str';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { BrandData, BrandGallerySlice } from './types';

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 6,
        slidesToSlide: 4 // optional, default to 1.
    },
    tablet: {
        breakpoint: { max: 1024, min: 768 },
        items: 3,
        slidesToSlide: 3 // optional, default to 1.
    },
    mobile: {
        breakpoint: { max: 767, min: 464 },
        items: 1,
        slidesToSlide: 1 // optional, default to 1.
    }
};
interface Props {
    slice: BrandGallerySlice;
}

/**
 * Brand gallery component.
 */
export const BrandGallery = ({
    slice: {
        items,
        primary: { highlightColor, title },
    },
}: Props) => {
    const router = useRouter();

    if (!items) {
        return null; // Replace Noop with null
    }

    const brandsLength = items.length || 0;
    const brandsData = items.slice(0, brandsLength >= 8 ? 8 : brandsLength).map(
        (brand): BrandData => ({
            name: brand?.brandName?.text,
            image: brand?.brand_image?.url,
            link: brand?.brand?.url,
            uid: brand?.brand?.uid,
        })
    );

    if (brandsData.some((brand) => brand.uid === undefined)) {
        return null; // Replace Noop with null
    }

    const brandTitle = (
        <div
            dangerouslySetInnerHTML={{
                __html: procStr(`<h1>${title?.text || ''}</h1>`),
            }}
        />
    );

    const getBrandCard = (brand: BrandData) => {
        return (
            <div
                key={brand.uid}
                className={`
          bg-white shadow-lg rounded-lg p-5 cursor-pointer transition-transform duration-200 hover:scale-110
        `}
                onClick={() => {
                    const data = brand.name || brand.link || brand.uid;
                    if (data) {
                        generateGtmBrandClick(data);
                    }
                    if (brand.link || brand.uid) {
                        void router.push(`/brands/${brand.link || brand.uid || ''}`);
                    }
                }}
            >
                {brand?.image && (
                    <img
                        src={brand.image}
                        alt={brand?.uid || ''}
                        width={200}
                        height={100}
                        className="w-full h-auto"
                    />
                )}
            </div>
        );
    };

    const brandCards =
        brandsData.map((brand) => (
            <div className="slider" key={brand.uid}>{getBrandCard(brand)}</div>
        ))

    const sliderImageUrl = [
        //First image url
        {
            url:
                "https://i2.wp.com/www.geeksaresexy.net/wp-content/uploads/2020/04/movie1.jpg?resize=600%2C892&ssl=1"
        },
        {
            url:
                "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/best-kids-movies-2020-call-of-the-wild-1579042974.jpg?crop=0.9760858955588091xw:1xh;center,top&resize=480:*"
        },
        //Second image url
        {
            url:
                "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/best-movies-for-kids-2020-sonic-the-hedgehog-1571173983.jpg?crop=0.9871668311944719xw:1xh;center,top&resize=480:*"
        },
        //Third image url
        {
            url:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQS82ET2bq9oTNwPOL8gqyoLoLfeqJJJWJmKQ&usqp=CAU"
        },

        //Fourth image url

        {
            url:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTdvuww0JDC7nFRxiFL6yFiAxRJgM-1tvJTxA&usqp=CAU"
        }
    ];

    return (
        <div className="flex justify-center bg-[#f6f3f2] my-4">
            <div
                className="flex flex-col justify-center items-center my-10"
                style={{ color: highlightColor }}
            >
                {brandTitle}


                <div className='w-[90vw] h-[300px]'>
                    <Carousel
                        responsive={responsive}
                        autoPlay={true}
                        swipeable={true}
                        draggable={true}
                        infinite={true}
                        partialVisible={false}
                    >
                        {brandCards}
                    </Carousel>

                </div>
                <Link
                    href="/brands"
                    className="block w-[187px] h-[47px] leading-[47px] bg-[#231f20] rounded-lg text-center text-[#e0d7d3] hover:text-[#e0d7d3] mt-4"
                    onClick={() => {
                        generateGtmEventWithData('GA-NHP-View-All-Brands');
                    }}
                >
                    View All Brands
                </Link>
            </div>
        </div>
    );
};


