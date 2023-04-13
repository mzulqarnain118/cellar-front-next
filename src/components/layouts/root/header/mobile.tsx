import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'

import dynamic from 'next/dynamic'
import Image from 'next/image'

import { Popover, Transition } from '@headlessui/react'
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Drawer, NavLink } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { asText } from '@prismicio/helpers'
import { PrismicLink } from '@prismicio/react'
import { clsx } from 'clsx'
import { signOut, useSession } from 'next-auth/react'

import { Search } from '@/components/search'
import { HOME_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useNavigationQuery } from '@/lib/queries/header'
import { useProcessStore } from '@/lib/stores/process'

const Link = dynamic(() => import('src/components/link').then(module => module.Link), {
  ssr: false,
})

interface MobileMenuProps {
  className?: string
}

export const MobileMenu = ({ className }: MobileMenuProps) => {
  const { data: session } = useSession()
  const [opened, { open, close }] = useDisclosure()
  const { setCartTriggerRef, setShaderVisible } = useProcessStore()
  const { data: cart } = useCartQuery()
  const { data: navigation } = useNavigationQuery()
  const ref = useRef<HTMLLabelElement | null>(null)

  const handleBlur = useCallback(() => setShaderVisible(false), [setShaderVisible])
  const handleFocus = useCallback(() => setShaderVisible(true), [setShaderVisible])

  const handleNavLinkClick = useCallback(() => {
    close()
  }, [close])

  useEffect(() => {
    if (ref.current) {
      setCartTriggerRef(ref.current)
    }
  }, [setCartTriggerRef])

  const quantityCount = useMemo(
    () => cart?.items.reduce((prev, current) => prev + current.quantity, 0),
    [cart?.items]
  )

  const drawerTrigger = useMemo(
    () => (
      <button
        aria-label="View menu"
        className={`
          btn-ghost drawer-button btn-sm btn relative flex h-11 w-11 items-center justify-center
          rounded-lg border-0 p-0 hover:border hover:bg-neutral-100
        `}
        onClick={open}
      >
        <Bars3Icon
          className={`
            h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
            group-hover:fill-neutral-200
          `}
        />
      </button>
    ),
    [open]
  )

  const menuOptions = useMemo(
    () =>
      navigation?.data.body.map(item => (
        <NavLink
          key={item.id}
          defaultOpened
          className="font-bold"
          component={item.primary.link.link_type !== 'Any' ? PrismicLink : undefined}
          field={item.primary.link}
          label={asText(item.primary.name)}
          onClick={item.items.length > 0 ? undefined : handleNavLinkClick}
        >
          {item.items.length > 0 &&
            item.items
              .map(subItem => {
                if (subItem.child_link.link_type !== 'Any' && 'url' in subItem.child_link) {
                  return (
                    <NavLink
                      key={`${item.id}-${subItem.child_link.url}-${asText(subItem.child_name)}`}
                      component={PrismicLink}
                      field={subItem.child_link}
                      label={asText(subItem.child_name)}
                      onClick={handleNavLinkClick}
                    />
                  )
                }
                return undefined
              })
              .filter(Boolean)}
        </NavLink>
      )),
    [handleNavLinkClick, navigation?.data.body]
  )

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
              btn-ghost btn p-0 hover:bg-neutral-100
            `,
            session?.user !== undefined && 'font-normal'
          )}
          href={SIGN_IN_PAGE_PATH}
        >
          <UserIcon
            className={`
              h-6 w-6 fill-neutral-50 stroke-neutral-900 transition-colors
              group-hover:fill-neutral-200
            `}
          />
        </Link>
      ),
    [session?.user]
  )

  return (
    <>
      <Drawer opened={opened} onClose={close}>
        {menuOptions}
      </Drawer>
      <div className={clsx('container mx-auto lg:hidden', className)}>
        <div className="flex items-center justify-between py-3">
          {drawerTrigger}
          <Link href={HOME_PAGE_PATH}>
            <Image alt="Scout & Cellar Company Logo" height={48} src="/logo.svg" width={178} />
          </Link>
          <div className="flex items-center gap-2">
            {userButton}
            <label
              ref={ref}
              aria-label="View shopping cart"
              className={`
                btn-ghost drawer-button btn-sm btn relative flex h-11 items-center
                justify-center rounded-lg border p-0 hover:bg-neutral-100
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
        <Search
          className="mb-2"
          id="mobile-menu-search"
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </div>
    </>
  )
}
