import { clsx } from 'clsx'
import Image from 'next/image'

interface CompanyLogoProps {
  className?: string
  size?: 'md' | 'lg'
  white?: boolean
}

export const CompanyLogo = ({ className, size = 'md', white = false }: CompanyLogoProps) => (
  <div
    className={clsx(
      'relative h-10 w-[10.25rem] lg:h-[5.25rem] lg:w-[15.5rem]',
      size === 'lg' && '!w-[21.75rem]',
      className
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
