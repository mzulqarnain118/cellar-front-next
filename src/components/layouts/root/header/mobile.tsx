import { useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  Bars3Icon,
  ChevronRightIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import { Search } from '@/components/search'
import { Accordion } from '@/core/components/accordion'
import { Drawer } from '@/core/components/drawer'
import { COFFEE_PAGE_PATH, HOME_PAGE_PATH, MERCH_PAGE_PATH, WINE_PAGE_PATH } from '@/lib/paths'

interface MobileMenuProps {
  className?: string
}

export const MobileMenu = ({ className }: MobileMenuProps) => {
  const [open, setOpen] = useState(false)

  const drawerTrigger = useMemo(
    () => (
      <button
        aria-label="Open menu"
        className="group rounded-lg p-1 transition-colors hover:bg-neutral-200"
        type="button"
      >
        <Bars3Icon
          className={`
            h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
            group-hover:fill-neutral-200
          `}
        />
      </button>
    ),
    []
  )

  return (
    <div className={clsx('container mx-auto lg:hidden', className)}>
      <div className="flex items-center justify-between py-3">
        <Drawer
          as="nav"
          id="mobile-menu-drawer"
          open={open}
          setOpen={setOpen}
          trigger={drawerTrigger}
        >
          <div className="flex flex-col">
            <Search className="my-3 px-4" id="mobile-menu-search-top" />
            <Accordion openByDefault header="Wine" headerClassName="px-4 bg-neutral-200">
              <div className="flex w-screen flex-col divide-y divide-neutral-300 py-0">
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href={WINE_PAGE_PATH}>
                  <div className="flex w-full items-center justify-between px-4">Shop All</div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Red
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    White
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Rosé
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Bubbly
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
              </div>
            </Accordion>
            <Accordion openByDefault header="Subscriptions" headerClassName="px-4 bg-neutral-200">
              <div className="flex w-screen flex-col divide-y divide-neutral-300 py-0">
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href={WINE_PAGE_PATH}>
                  <div className="flex w-full items-center justify-between px-4">Shop All</div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Scout Circle
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Auto-Sip™
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
              </div>
            </Accordion>
            <Accordion header="Merch" headerClassName="px-4 bg-neutral-200">
              <div className="flex w-screen flex-col divide-y divide-neutral-300 py-0">
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href={MERCH_PAGE_PATH}>
                  <div className="flex w-full items-center justify-between px-4">Shop All</div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Gift Cards
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Wearables
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Drinkware
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
              </div>
            </Accordion>
            <Accordion header="Coffee" headerClassName="px-4 bg-neutral-200">
              <div className="flex w-screen flex-col divide-y divide-neutral-300 py-0">
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href={COFFEE_PAGE_PATH}>
                  <div className="flex w-full items-center justify-between px-4">Shop All</div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Ground Coffee
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Whole Bean Coffee
                    <ChevronRightIcon height={20} width={20} />
                  </div>
                </Link>
              </div>
            </Accordion>
            <Accordion header="About" headerClassName="px-4 bg-neutral-200">
              <div className="flex w-screen flex-col divide-y divide-neutral-300 py-0">
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="">
                  <div className="flex w-full items-center justify-between px-4">Our Story</div>
                </Link>
                <Link className="py-3 hover:bg-neutral-100 hover:underline" href="/">
                  <div className="flex w-full items-center justify-between px-4">
                    Our Clean-Crafted Commitment
                  </div>
                </Link>
              </div>
            </Accordion>
          </div>
        </Drawer>
        <Link className="ml-9" href={HOME_PAGE_PATH}>
          <Image alt="Scout & Cellar Company Logo" height={48} src="/logo.svg" width={178} />
        </Link>
        <div className="flex gap-3">
          <Link
            className="group rounded-lg p-1 transition-colors hover:bg-neutral-200"
            href={HOME_PAGE_PATH}
          >
            <UserIcon className="h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors group-hover:fill-neutral-200" />
          </Link>
          <Link
            className="group rounded-lg p-1 transition-colors hover:bg-neutral-200"
            href={HOME_PAGE_PATH}
          >
            <ShoppingCartIcon className="h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors group-hover:fill-neutral-200" />
          </Link>
        </div>
      </div>
      <Search className="mb-2" id="mobile-menu-search" />
    </div>
  )
}
