import { HTMLProps, forwardRef } from 'react'

import { ImageProps } from 'next/image'

import { clsx } from 'clsx'

import { BlurImage } from '@/components/blur-image'

type Props = HTMLProps<HTMLInputElement> &
  ImageProps & {
    scale?: boolean
  }

export const MediaGalleryImage = forwardRef<HTMLImageElement, Props>(({ scale, ...props }, ref) => (
  <div
    className={clsx(
      'relative mx-auto h-[21.75rem] w-[16.75rem] lg:h-[33rem] lg:w-[22.5rem]',
      scale && 'static !h-[1500px] !w-[1200px]'
    )}
    style={
      scale
        ? {
            backgroundColor: '#f5f3f2',
            border: '1px solid #949494',
            boxShadow: 'rgb(0 0 0 / 25%) 0px 6px 8px 2px',
            zIndex: '1000',
          }
        : undefined
    }
  >
    <BlurImage
      {...props}
      ref={ref}
      priority
      className="object-contain"
      fill={!scale}
      sizes={scale ? undefined : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw'}
    />
  </div>
))

MediaGalleryImage.displayName = 'MediaGalleryImage'
