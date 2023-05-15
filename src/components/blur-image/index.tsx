import { useCallback, useState } from 'react'

import { clsx } from 'clsx'
import Image, { ImageProps } from 'next/image'

export const BlurImage = ({ alt, className, ...rest }: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const onLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <Image
      {...rest}
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
