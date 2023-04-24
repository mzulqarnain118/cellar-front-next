import Image from 'next/image'

import { clsx } from 'clsx'

interface CompanyLogoProps {
  className?: string
  size?: 'md' | 'lg'
  white?: boolean
}

export const CompanyLogo = ({ className, size = 'md', white = false }: CompanyLogoProps) => (
  <div className={clsx('relative h-8 w-32', size === 'lg' && '!h-10 !w-36', className)}>
    <Image
      fill
      priority
      alt="Scout & Cellar Company Logo"
      sizes="(max-width: 640px) 11rem, (max-width: 1024px) 15rem"
      src={white ? '/white-logo.svg' : '/logo.svg'}
    />
  </div>
)
