import { forwardRef, useCallback, useState } from 'react'

import Image, { ImageProps } from 'next/image'

import { clsx } from 'clsx'

export const BlurImage = forwardRef<HTMLImageElement, ImageProps>(
  ({ alt, className, ...rest }: ImageProps, ref) => {
    const [isLoading, setIsLoading] = useState(true)

    const onLoadingComplete = useCallback(() => {
      setIsLoading(false)
    }, [])

    return (
      <Image
        {...rest}
        ref={ref}
        alt={alt}
        className={clsx(
          className,
          'duration-300 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={onLoadingComplete}
      />
    )
  }
)

BlurImage.displayName = 'BlurImage'
