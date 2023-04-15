import Image from 'next/image'

import { clsx } from 'clsx'

interface CompanyLogoProps {
  size?: 'md' | 'lg'
  white?: boolean
}

export const CompanyLogo = ({ size = 'md', white = false }: CompanyLogoProps) => (
  <div
    className={clsx(
      'relative h-12 w-44 lg:h-14 lg:w-60 xl:h-16 xl:w-64',
      size === 'lg' && 'w-50 h-14 lg:h-16 lg:w-64 xl:h-20 xl:w-72'
    )}
  >
    <Image
      fill
      priority
      alt="Scout & Cellar Company Logo"
      sizes="(max-width: 640px) 11rem, (max-width: 1024px) 15rem"
      src={white ? '/white-logo.svg' : '/logo.svg'}
    />
  </div>
)
