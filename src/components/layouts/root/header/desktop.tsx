import { UserIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import {
  CLUBS_PAGE_PATH,
  COFFEE_PAGE_PATH,
  HOME_PAGE_PATH,
  MERCH_PAGE_PATH,
  SIGN_IN_PAGE_PATH,
  WINE_PAGE_PATH,
} from '@/lib/paths'

import { CartDrawer } from './cart-drawer'

interface DesktopMenuProps {
  className?: string
}

export const DesktopMenu = ({ className }: DesktopMenuProps) => {
  const { data } = useSession()

  return (
    <div className={clsx(className, 'items-center justify-between')}>
      <div className="flex w-full items-center justify-between py-4 text-neutral-500">
        <Link href={HOME_PAGE_PATH}>
          <CompanyLogo />
        </Link>
        <div className="flex w-full items-center justify-evenly font-bold">
          <Link
            className="block rounded-lg py-2 px-3 transition hover:bg-neutral-100"
            href={WINE_PAGE_PATH}
          >
            Wine
          </Link>
          <Link
            className="block rounded-lg py-2 px-3 transition hover:bg-neutral-100"
            href={COFFEE_PAGE_PATH}
          >
            Coffee
          </Link>
          <Link
            className="block rounded-lg py-2 px-3 transition hover:bg-neutral-100"
            href={CLUBS_PAGE_PATH}
          >
            Clubs
          </Link>
          <Link
            className="block rounded-lg py-2 px-3 transition hover:bg-neutral-100"
            href={MERCH_PAGE_PATH}
          >
            Merch
          </Link>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-7">
        <Search className="w-auto grow" id="desktop-search" />
        <div className="group h-11 w-max text-center">
          <div className="flex h-11 items-center gap-8 rounded-lg pl-4 pr-6 group-hover:bg-neutral-100">
            <Link
              aria-label="Sign in"
              className="flex flex-wrap items-center justify-center gap-1"
              href={SIGN_IN_PAGE_PATH}
            >
              <UserIcon className="h-6 w-6" />
              <span
                className={`
              hidden text-neutral-400 transition-all group-hover:text-neutral-500
              group-hover:underline xl:block
            `}
              >
                {data?.user.name ? `Hi, ${data.user.name.first}` : 'Sign in'}
              </span>
            </Link>
          </div>
        </div>
        <CartDrawer />
      </div>
    </div>
  )
}
