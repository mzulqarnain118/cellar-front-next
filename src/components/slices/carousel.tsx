import { Content } from '@prismicio/client'
import { SliceComponentProps } from '@prismicio/react'
import ReactMultiCarousel from 'react-multi-carousel'

import 'react-multi-carousel/lib/styles.css'

type CarouselProps = SliceComponentProps<Content.HomePageDocumentDataBodyCarouselSlice>

export const Carousel = ({ slice }: CarouselProps) => {
  // const slideElements = slice.items?.map(
  //   (slide: Content.HeroCarouselDocumentDataSlidesItem, index) => (
  //     <div key={`slide-${slide.title[0].text}`}>
  //       <div className="container mx-auto flex flex-col-reverse gap-8">
  //         <div className="flex-1">
  //           {/* <PrismicRichText field={slide.title} />
  //         <PrismicRichText field={slide.subtitle} /> */}
  //         </div>
  //         <div className="flex-1">
  //           {/* <Image
  //           alt="Test"
  //           height={700}
  //           src={slide.image.url}
  //           width={760}
  //         /> */}
  //         </div>
  //       </div>
  //     </div>
  //   )
  // )

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      // slidesToSlide: 3, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      // slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      // slidesToSlide: 2, // optional, default to 1.
    },
  }
  return (
    <ReactMultiCarousel
      // autoPlay={this.props.deviceType !== 'mobile'}
      autoPlaySpeed={1000}
      containerClass="carousel-container h-[750px]"
      customTransition="all .5"
      // deviceType={this.props.deviceType}
      dotListClass="custom-dot-list-style"
      draggable={false}
      infinite={true}
      itemClass="carousel-item-padding-40-px"
      keyBoardControl={true}
      removeArrowOnDeviceType={['tablet', 'mobile']}
      responsive={responsive}
      showDots={true}
      ssr={true} // means to render carousel on server-side.
      swipeable={false}
      transitionDuration={500}
    >
      {/* {slideElements} */}
    </ReactMultiCarousel>
  )
}
