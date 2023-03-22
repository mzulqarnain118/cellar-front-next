import { useCallback, useEffect, useRef } from 'react'

import Link from 'next/link'

import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

import { Navigation } from './navigation'
interface DesktopMenuProps {
  className?: string
}

export const DesktopMenu = ({ className }: DesktopMenuProps) => {
  const { setCartTriggerRef, setShaderVisible } = useProcessStore()
  const { data } = useCartQuery()
  const ref = useRef<HTMLLabelElement | null>(null)

  const handleBlur = useCallback(() => setShaderVisible(false), [setShaderVisible])
  const handleFocus = useCallback(() => setShaderVisible(true), [setShaderVisible])

  useEffect(() => {
    if (ref.current) {
      setCartTriggerRef(ref.current)
    }
  }, [setCartTriggerRef])

  const quantityCount = data?.items.reduce((prev, current) => prev + current.quantity, 0)

  return (
    <div className={clsx('hidden lg:block', className)}>
      <div className="container mx-auto flex h-28 items-center justify-between gap-20">
        <Link href={HOME_PAGE_PATH}>
          <CompanyLogo />
        </Link>
        <Search id="desktop-menu-search" onBlur={handleBlur} onFocus={handleFocus} />
        <div className="flex gap-6">
          <Link
            className={`
              btn-ghost btn flex w-max items-center gap-2 hover:bg-neutral-100 hover:underline
            `}
            href={HOME_PAGE_PATH}
          >
            <UserIcon className="h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors" />
            Sign in
          </Link>
          <label
            ref={ref}
            aria-label="View shopping cart"
            className={`
              btn-ghost drawer-button btn-sm btn relative flex h-11 w-11 items-center justify-center
              rounded-lg border p-0 hover:bg-neutral-100
            `}
            htmlFor="cart-drawer"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
            {!!quantityCount && (
              <div
                className={`
                  absolute top-0 right-0.5 h-4 min-w-[1rem] max-w-[2rem] rounded-full bg-brand
                  px-1 text-center text-xs font-normal leading-4 text-neutral-100
                `}
              >
                {quantityCount}
              </div>
            )}
          </label>
        </div>
      </div>
      <Navigation />
    </div>
  )
}
