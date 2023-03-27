import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'

import dynamic from 'next/dynamic'

import { Popover, Transition } from '@headlessui/react'
import {
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { signOut, useSession } from 'next-auth/react'

import { CompanyLogo } from '@/components/company-logo'
import { Search } from '@/components/search'
import { HOME_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

import { Navigation } from './navigation'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

interface DesktopMenuProps {
  className?: string
}

export const DesktopMenu = ({ className }: DesktopMenuProps) => {
  const { data: session } = useSession()
  const { setCartTriggerRef, setShaderVisible } = useProcessStore()
  const { data } = useCartQuery()
  const ref = useRef<HTMLLabelElement | null>(null)

  const handleBlur = useCallback(() => setShaderVisible(false), [setShaderVisible])
  const handleFocus = useCallback(() => setShaderVisible(true), [setShaderVisible])

  const quantityCount = data?.items.reduce((prev, current) => prev + current.quantity, 0)

  const userButton = useMemo(
    () =>
      session?.user !== undefined ? (
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button
                className={clsx(
                  `
                    btn-ghost btn flex w-max items-center gap-0.5 font-normal hover:bg-neutral-100
                    hover:underline
                  `,
                  open && 'bg-neutral-100'
                )}
              >
                <UserIcon
                  className={`
                    h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
                  `}
                />
                <span>Hi, {session.user.name.first}</span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className={`
                  ${open ? '' : 'text-opacity-70'}
                    ml-2 h-5 w-5 text-neutral-500 duration-150 ease-in-out
                    group-hover:text-opacity-80
                  `}
                />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  className={`
                    absolute left-6 z-10 mt-3 w-60 max-w-sm -translate-x-1/2 transform px-4
                    sm:px-0 lg:max-w-3xl
                  `}
                >
                  <div
                    className={`
                      overflow-hidden rounded shadow-lg ring-1 ring-black ring-opacity-5
                    `}
                  >
                    <div className="relative grid bg-white">
                      <Link
                        className="btn-ghost btn flex h-12 items-center justify-start px-7 hover:bg-gray-50"
                        href="/account"
                      >
                        Account
                      </Link>
                      <Link
                        className="btn-ghost btn flex h-12 items-center justify-start px-7 hover:bg-gray-50"
                        href="/account/orders"
                      >
                        Orders
                      </Link>
                      <Link
                        className="btn-ghost btn flex h-12 items-center justify-start px-7 hover:bg-gray-50"
                        href="/account/subscriptions"
                      >
                        Subscriptions
                      </Link>
                      <button
                        className="btn-ghost btn flex h-12 items-center justify-start gap-2 px-7 hover:bg-gray-50"
                        onClick={() => signOut()}
                      >
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        Sign out
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4">
                      <a
                        className={`
                          flow-root rounded-md px-2 py-2 transition duration-150 ease-in-out
                          hover:bg-gray-100 focus:outline-none focus-visible:ring
                          focus-visible:ring-orange-500 focus-visible:ring-opacity-50
                        `}
                        href="##"
                      >
                        <span className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">Documentation</span>
                        </span>
                        <span className="block text-sm text-gray-500">
                          Start integrating products and tools
                        </span>
                      </a>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      ) : (
        <Link
          className={clsx(
            `
              btn-ghost btn flex w-max items-center gap-2 hover:bg-neutral-100 hover:underline
            `,
            session?.user !== undefined && 'gap-0.5 font-normal'
          )}
          href={SIGN_IN_PAGE_PATH}
        >
          <UserIcon className="h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors" />
          Sign in
        </Link>
      ),
    [session?.user]
  )

  useEffect(() => {
    if (ref.current) {
      setCartTriggerRef(ref.current)
    }
  }, [setCartTriggerRef])

  return (
    <div className={clsx('hidden lg:block', className)}>
      <div className="container mx-auto flex h-28 items-center justify-between gap-20">
        <Link href={HOME_PAGE_PATH}>
          <CompanyLogo />
        </Link>
        <Search id="desktop-menu-search" onBlur={handleBlur} onFocus={handleFocus} />
        <div className="flex gap-6">
          {userButton}
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
