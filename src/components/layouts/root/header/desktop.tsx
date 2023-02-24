import { useCallback } from 'react'

import Link from 'next/link'

import { UserIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { useProcessStore } from '@/lib/stores/process'

import { CartDrawer } from './cart-drawer'
import { Navigation } from './navigation'
interface DesktopMenuProps {
  className?: string
}

export const DesktopMenu = ({ className }: DesktopMenuProps) => {
  const { setShaderVisible } = useProcessStore()

  const handleBlur = useCallback(() => setShaderVisible(false), [setShaderVisible])
  const handleFocus = useCallback(() => setShaderVisible(true), [setShaderVisible])

  return (
    <div className={clsx('hidden lg:block', className)}>
      <div className="container mx-auto flex h-28 items-center justify-between gap-20">
        <Link href={HOME_PAGE_PATH}>
          <CompanyLogo />
        </Link>
        <Search id="desktop-menu-search" onBlur={handleBlur} onFocus={handleFocus} />
        <div className="flex gap-6">
          <Link className="flex w-max items-center gap-2 hover:underline" href={HOME_PAGE_PATH}>
            <UserIcon className="h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors" />
            Sign in
          </Link>
          <CartDrawer />
        </div>
      </div>
      <Navigation />
    </div>
  )
}
