import { useCallback } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/router'

import { clsx } from 'clsx'

import { HOME_PAGE_PATH } from '@/lib/paths'

interface CompanyLogoFooterProps {
  className?: string
  size?: 'md' | 'lg'
  white?: boolean
}

export const CompanyLogoFooter = ({ className, size = 'md', white = false }: CompanyLogoFooterProps) => {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(HOME_PAGE_PATH)
  }, [router])

  return (
    <div
      className={clsx(
        'relative h-[9.884rem] w-[10.25rem] lg:h-[216px] lg:w-56',
        size === 'lg' && '!w-[21.75rem]',
        className
      )}
    >
      <Image
        fill
        priority
        alt="Scout & Cellar Company Logo"
        className="cursor-pointer"
        sizes="(max-width: 640px) 11rem, (max-width: 1024px) 15rem"
        src={white ? '/white-logo2.png' : '/logo.svg'}
        onClick={handleClick}
      />
    </div>
  )
}
