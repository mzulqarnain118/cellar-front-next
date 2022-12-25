import { Bars3Icon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

import { Search } from '@/components/search'
import { HOME_PAGE_PATH } from '@/lib/paths'

const DynamicDrawer = dynamic(() => import('@/ui/drawer').then(module => module.Drawer))

interface MobileMenuProps {
  className?: string
}

export const MobileMenu = ({ className }: MobileMenuProps) => (
  <div className={className}>
    <div className="flex items-center justify-between py-2 text-neutral-500">
      <DynamicDrawer
        as="nav"
        id="mobile-menu-drawer"
        trigger={
          <button
            aria-label="Open menu"
            className="rounded-md transition-colors hover:bg-neutral-50"
            type="button"
          >
            <Bars3Icon
              className={`
                h-6 w-6 hover:fill-neutral-600 hover:transition-colors
              `}
            />
          </button>
        }
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <h6 className="mb-2">Wine</h6>
              <div className="flex flex-col gap-4 border-t border-t-neutral-100 py-4">
                <div className="flex gap-3">
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                </div>
                <div className="flex gap-3">
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                </div>
              </div>
            </div>
            <div>
              <h6 className="mb-2">Clubs</h6>
              <div className="flex flex-col gap-4 border-t border-t-neutral-100 py-4">
                <div className="flex gap-3">
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                </div>
              </div>
            </div>
            <div>
              <h6 className="mb-2">Coffee</h6>
              <div className="flex flex-col gap-4 border-t border-t-neutral-100 py-4">
                <div className="flex gap-3">
                  <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-neutral-200" />
                </div>
              </div>
            </div>
          </div>
          <Search id="mobile-drawer-menu-search" />
        </div>
      </DynamicDrawer>
      <Link className="ml-9" href={HOME_PAGE_PATH}>
        <Image alt="Scout & Cellar Company Logo" height={48} src="/logo.svg" width={178} />
      </Link>
      <div className="flex gap-3 text-neutral-400">
        <Link href={HOME_PAGE_PATH}>
          <UserIcon
            className={`
              h-6 w-6 hover:fill-neutral-600 hover:transition-colors
            `}
          />
        </Link>
        <Link href={HOME_PAGE_PATH}>
          <ShoppingCartIcon className="h-6 w-6 hover:fill-neutral-600 hover:transition-colors" />
        </Link>
      </div>
    </div>
    <Search id="mobile-menu-search" />
  </div>
)
