import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import Link from 'next/link'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import {
  CLUBS_PAGE_PATH,
  COFFEE_PAGE_PATH,
  HOME_PAGE_PATH,
  MERCH_PAGE_PATH,
  WINE_PAGE_PATH,
} from '@/lib/paths'

interface DesktopMenuProps {
  className?: string
}

export const DesktopMenu = ({ className }: DesktopMenuProps) => (
  <div className={clsx(className, 'items-center justify-between')}>
    <div className="flex w-full items-center justify-between py-4 text-neutral-500">
      <Link href={HOME_PAGE_PATH}>
        <CompanyLogo />
      </Link>
      <div className="flex w-full items-center justify-evenly font-bold">
        <Link
          className="block rounded py-2 px-3 transition hover:bg-neutral-100"
          href={WINE_PAGE_PATH}
        >
          Wine
        </Link>
        <Link
          className="block rounded py-2 px-3 transition hover:bg-neutral-100"
          href={COFFEE_PAGE_PATH}
        >
          Coffee
        </Link>
        <Link
          className="block rounded py-2 px-3 transition hover:bg-neutral-100"
          href={CLUBS_PAGE_PATH}
        >
          Clubs
        </Link>
        <Link
          className="block rounded py-2 px-3 transition hover:bg-neutral-100"
          href={MERCH_PAGE_PATH}
        >
          Merch
        </Link>
      </div>
    </div>
    <div className="flex w-full items-center justify-between gap-7">
      <Search className="w-auto grow" id="desktop-search" />
      <div className="flex items-center gap-8 text-center">
        <Link
          aria-label="Sign in"
          className="group flex flex-wrap items-center justify-center gap-1"
          href={HOME_PAGE_PATH}
        >
          <UserIcon
            className={`
              h-6 w-6 fill-primary-400 transition-[fill] group-hover:fill-primary-500
            `}
          />
          <span
            className={`
              hidden text-neutral-400 transition-all group-hover:text-neutral-500
              group-hover:underline xl:block
            `}
          >
            Sign in
          </span>
        </Link>
        <Link aria-label="View shopping cart" href={HOME_PAGE_PATH}>
          <ShoppingCartIcon
            className={`h-6 w-6 fill-primary-400 transition-all hover:fill-primary-500`}
          />
        </Link>
      </div>
    </div>
  </div>
)
