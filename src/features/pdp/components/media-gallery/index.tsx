/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable react/jsx-no-comment-textnodes */
'use client'

import { Fragment, useCallback, useMemo, useRef, useState } from 'react'

import ReactImageMagnify, { ImageProps, MagnifiedImageProps } from '@blacklab/react-image-magnify'
import { PlayIcon } from '@heroicons/react/20/solid'
import { Carousel } from '@mantine/carousel'
import { Skeleton } from '@mantine/core'
import { Content } from '@prismicio/client'
import { GroupField, LinkType } from '@prismicio/types'
import { clsx } from 'clsx'
import { useIsClient } from 'usehooks-ts'

import { BlurImage } from '@/components/blur-image'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { Simplify } from '@/lib/types/prismic'

import { Hint } from './hint'
import { MediaGalleryImage } from './image'

interface ImageSchema {
  alt?: string
  dimensions?: {
    height: number
    width: number
  }
  src: string
  srcSet?: string
}

interface MediaGalleryProps {
  className?: string
  hasTastingVideo?: boolean
  images: ImageSchema[]
  videos?: GroupField<Simplify<Content.PdpDocumentDataVideosItem>>
}

type ImageOrVideo = ImageSchema | Simplify<Content.PdpDocumentDataVideosItem>

const isImage = (item: unknown): item is ImageSchema =>
  !!item && typeof item === 'object' && 'src' in item

export const MediaGallery = ({
  className,
  hasTastingVideo = false,
  images,
  videos,
}: MediaGalleryProps) => {
  const isDesktop = useIsDesktop()
  const isClient = useIsClient()
  const mediaRefs = useRef<HTMLDivElement[]>([])
  const videoMediaItems: Simplify<Content.PdpDocumentDataVideosItem>[] = useMemo(
    () => videos || [],
    [videos]
  )
  const mediaItems: ImageOrVideo[] = useMemo(() => {
    if (hasTastingVideo) {
      return [
        ...images.splice(0, 1),
        ...(videoMediaItems?.splice(0, 1) || []),
        ...images.splice(0, images.length),
        ...(videoMediaItems?.splice(0, videoMediaItems.length) || []),
      ]
    }

    if (videos !== undefined) {
      return [...images, ...videos]
    }

    return [...images]
  }, [hasTastingVideo, images, videoMediaItems, videos])
  const [activeMediaItem, setActiveMediaItem] = useState<ImageOrVideo>(mediaItems[0])

  const magnifiedImageProps: MagnifiedImageProps | undefined = useMemo(() => {
    if (isImage(activeMediaItem)) {
      const imageUrl = new URL(activeMediaItem.src)
      imageUrl.searchParams.set('w', '1000')
      imageUrl.searchParams.set('h', '1000')

      return {
        height: 1000,
        scale: true,
        src: imageUrl.toString(),
        srcSet: activeMediaItem.srcSet,
        width: 1000,
      }
    }
  }, [activeMediaItem])

  const imageProps: ImageProps | undefined = useMemo(() => {
    if (isImage(activeMediaItem)) {
      const imageUrl = new URL(activeMediaItem.src)
      imageUrl.searchParams.set('w', '360')
      imageUrl.searchParams.set('h', '528')

      return {
        alt: activeMediaItem.alt || 'Product',
        isfluidwidth: 'false',
        scale: false,
        src: activeMediaItem.src,
        srcSet: activeMediaItem.srcSet,
      }
    }
  }, [activeMediaItem])

  const style = useMemo(() => ({ height: isDesktop ? 526 : 345 }), [isDesktop])

  const handleThumbnailClick = useCallback(
    (mediaItem: ImageOrVideo, index: number) => {
      if (mediaItems && mediaItem) {
        setActiveMediaItem(mediaItem)
        mediaRefs.current[index]?.classList.add('active')

        for (let imgIndex = 0; imgIndex < mediaItems.length; imgIndex++) {
          if (index !== imgIndex) {
            mediaRefs.current[imgIndex]?.classList.remove('active')
          }
        }
      }
    },
    [mediaItems]
  )

  const addRefs = useCallback((mediaItemDivElement: HTMLDivElement) => {
    if (mediaItemDivElement && !mediaRefs.current.includes(mediaItemDivElement)) {
      mediaRefs.current = [...mediaRefs.current, mediaItemDivElement]
    }
  }, [])

  const activeMediaItemIndex = useMemo(
    () =>
      mediaItems.findIndex(item => {
        if (activeMediaItem && item) {
          const isActiveItemImage = isImage(activeMediaItem)
          const isCurrentItemImage = isImage(item)

          if (!isActiveItemImage && !isCurrentItemImage) {
            return activeMediaItem.video.embed_url === item.video.embed_url
          } else if (!!isActiveItemImage && !!isCurrentItemImage) {
            return activeMediaItem.src === item.src
          }
        }
        return false
      }),
    [activeMediaItem, mediaItems]
  )

  const handleKeyboardPress = useCallback(
    (item: ImageOrVideo, index: number) => {
      if (isImage(item)) {
        handleThumbnailClick(item, index)
      }
    },
    [handleThumbnailClick]
  )

  const mediaItemElements = useMemo(
    () =>
      mediaItems.map((item, index) => {
        const itemCheck =
          (!isImage(item) && !!item && !item.video.thumbnail_url) || (!!isImage(item) && !item.src)
        if (itemCheck) {
          // eslint-disable-next-line react/no-array-index-key
          return <Fragment key={index} />
        }

        const key = !isImage(item) ? item?.video.thumbnail_url || '' : item.src
        const alt = !isImage(item)
          ? item?.video.thumbnail_url || 'Product Video'
          : item.alt || 'Product'
        let src = ''
        if (!isImage(item) && item?.video.thumbnail_url) {
          src = item.video.thumbnail_url
        } else if (!!isImage(item) && item.src) {
          const flightFileTypeIndex = item.src.lastIndexOf('.')
          src = flightFileTypeIndex
            ? `${item.src}`
            : `${item.src.substring(0, flightFileTypeIndex)}thumb-50${item.src.substring(
                flightFileTypeIndex,
                item.src.length
              )}`
        }

        return (
          <div
            key={key}
            ref={addRefs}
            aria-label="Thumbnail"
            className={clsx(
              'relative flex items-center justify-center rounded border border-neutral-light transition-colors',
              index === activeMediaItemIndex && '!border-neutral-dark'
            )}
            role="button"
            tabIndex={0}
            onClick={() => {
              // if (isImage(item)) {
              handleThumbnailClick(item, index)
              // }
            }}
            onKeyDown={() => handleKeyboardPress(item, index)}
          >
            {!isImage(item) ? (
              <PlayIcon
                className={`
                  absolute top-12 z-10 h-6 w-6 rounded-full border border-neutral-dark bg-white
                `}
              />
            ) : undefined}
            <div className="relative h-28 w-28">
              <BlurImage fill priority alt={alt} className="object-contain" src={src} />
            </div>
          </div>
        )
      }),
    [activeMediaItemIndex, addRefs, handleKeyboardPress, handleThumbnailClick, mediaItems]
  )

  const thumbnails = useMemo(
    () => (
      <Carousel
        withControls
        withIndicators
        align="start"
        className="py-10 max-w-[90svw] lg:!max-w-none"
        slideGap="md"
        slideSize="25%"
        slidesToScroll={3}
      >
        {mediaItemElements.map(thumbnail => (
          <Carousel.Slide key={thumbnail.key}>{thumbnail}</Carousel.Slide>
        ))}
      </Carousel>
    ),
    [mediaItemElements]
  )

  if (!isClient) {
    return (
      <>
        <Skeleton className="mx-auto h-[21.75rem] w-[16.5rem]" />
        <div className="flex space-x-4">
          <Skeleton className="h-28 w-28" />
          <Skeleton className="h-28 w-28" />
          <Skeleton className="h-28 w-28" />
        </div>
      </>
    )
  }

  let children = <></>
  if (isImage(activeMediaItem) && imageProps !== undefined && magnifiedImageProps !== undefined) {
    children = (
      <>
        <div style={style}>
          <ReactImageMagnify
            activationInteractionHint="hover"
            hintComponent={Hint}
            // @ts-ignore
            imageComponent={MediaGalleryImage}
            imageProps={imageProps}
            // @ts-ignore
            magnifiedImageComponent={MediaGalleryImage}
            magnifiedImageProps={magnifiedImageProps}
          />
        </div>
        {mediaItemElements.length > 1 ? thumbnails : undefined}
      </>
    )
  }

  if (
    !isImage(activeMediaItem) &&
    activeMediaItem.video_link.link_type === LinkType.Media &&
    'url' in activeMediaItem.video_link
  ) {
    children = (
      <>
        <div className="inline-flex h-[21.75rem] w-auto lg:h-[33rem]">
          <video controls playsInline className="rounded" controlsList="nodownload">
            <source src={activeMediaItem.video_link.url} type="video/mp4" />
            {activeMediaItem.video_captions.link_type === 'Media' &&
            'url' in activeMediaItem.video_captions ? (
              <track
                default
                kind="subtitles"
                label="English"
                src={activeMediaItem.video_captions.url}
                srcLang="en"
              />
            ) : undefined}
          </video>
        </div>
        {mediaItemElements.length > 1 ? thumbnails : undefined}
      </>
    )
  }

  return (
    <div className={clsx('inline-flex flex-col items-center justify-center', className)}>
      {children}
    </div>
  )
}
