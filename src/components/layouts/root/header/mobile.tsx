import { useCallback, useEffect, useMemo, useRef } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { Bars3Icon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import { Search } from '@/components/search'
import { HOME_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

interface MobileMenuProps {
  className?: string
}

export const MobileMenu = ({ className }: MobileMenuProps) => {
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

  const drawerTrigger = useMemo(
    () => (
      <label
        aria-label="View menu"
        className={`
          btn-ghost drawer-button btn-sm btn relative flex h-11 w-11 items-center justify-center
          rounded-lg border-0 p-0 hover:border hover:bg-neutral-100
        `}
        htmlFor="menu-drawer"
      >
        <Bars3Icon
          className={`
            h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
            group-hover:fill-neutral-200
          `}
        />
      </label>
    ),
    []
  )

  return (
    <div className={clsx('container mx-auto lg:hidden', className)}>
      <div className="flex items-center justify-between py-3">
        {drawerTrigger}
        <Link className="ml-9" href={HOME_PAGE_PATH}>
          <Image alt="Scout & Cellar Company Logo" height={48} src="/logo.svg" width={178} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            className="group rounded-lg p-1 transition-colors hover:bg-neutral-200"
            href={HOME_PAGE_PATH}
          >
            <UserIcon
              className={`
                h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
                group-hover:fill-neutral-200
              `}
            />
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
                  px-1 text-center text-xs font-bold leading-4 text-neutral-100
                `}
              >
                {quantityCount}
              </div>
            )}
          </label>
        </div>
      </div>
      <Search className="mb-2" id="mobile-menu-search" onBlur={handleBlur} onFocus={handleFocus} />
    </div>
  )
}
