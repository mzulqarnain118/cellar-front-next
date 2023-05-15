import { useCallback, useMemo } from 'react'

import { ChevronDownIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import {
  ActionIcon,
  Burger,
  Divider,
  Drawer,
  Menu,
  ModalBaseCloseButtonProps,
  NavLink,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { asLink, asText } from '@prismicio/helpers'
import { PrismicLink } from '@prismicio/react'
import { useSession } from 'next-auth/react'
// eslint-disable-next-line import/order
import { useRouter } from 'next/router'
import { Indicator } from 'react-daisyui'

import { CompanyLogo } from '@/components/company-logo'
import { Link } from '@/components/link'
import { Search } from '@/components/search'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { HOME_PAGE_PATH, SIGN_IN_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useNavigationQuery } from '@/lib/queries/header'
import { useCartOpen } from '@/lib/stores/process'

import { CartDrawer } from '../cart-drawer'

const drawerCloseButtonProps: ModalBaseCloseButtonProps = {
  size: 'md',
}
const navLinkStyles = { label: { fontWeight: 400, letterSpacing: '0.05em' } }

const endIcon = <ChevronDownIcon className="h-3 w-3" />

export const Navigation = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const isDesktop = useIsDesktop()
  const { data: cart } = useCartQuery()
  const { toggleCartOpen } = useCartOpen()
  const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false)
  const { data: menu, isError: _, isFetching: _f, isLoading: _l } = useNavigationQuery()

  const onButtonClick = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  const handleNavLinkClick = useCallback(() => {
    closeMenu()
  }, [closeMenu])

  const menuItems = useMemo(
    () =>
      menu?.data.body?.map(link => {
        const hasChildren =
          link.items.length > 0 &&
          link.items.some(
            child => child.child_link.link_type !== 'Any' && 'url' in child.child_link
          )

        if (isDesktop) {
          if (hasChildren) {
            return (
              <Menu key={link.id} withArrow closeDelay={400} openDelay={100} trigger="hover">
                <Menu.Target>
                  <Button
                    className="text-neutral-dark no-underline"
                    endIcon={endIcon}
                    variant="link"
                  >
                    {asText(link.primary.name)}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  {link.items
                    .map(subItem => {
                      if (subItem.child_link.link_type !== 'Any' && 'url' in subItem.child_link) {
                        return (
                          <Menu.Item
                            key={`${link.id}-${subItem.child_link.url}-${asText(
                              subItem.child_name
                            )}`}
                            component={PrismicLink}
                            field={subItem.child_link}
                          >
                            {asText(subItem.child_name)}
                          </Menu.Item>
                        )
                      }
                      return undefined
                    })
                    .filter(Boolean)}
                </Menu.Dropdown>
              </Menu>
            )
          } else {
            return (
              <Button
                key={link.id}
                className="text-neutral-dark no-underline"
                variant="link"
                // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
                onClick={() => onButtonClick(asLink(link.primary.link) as string)}
              >
                {asText(link.primary.name)}
              </Button>
            )
          }
        }

        return (
          <div key={link.id} className="grid">
            <NavLink
              noWrap
              component={link.primary.link.link_type !== 'Any' ? PrismicLink : undefined}
              field={link.primary.link}
              label={asText(link.primary.name)}
              rightSection={!hasChildren && null}
              onClick={hasChildren ? undefined : handleNavLinkClick}
            >
              {hasChildren &&
                link.items
                  .map(subItem => {
                    if (subItem.child_link.link_type !== 'Any' && 'url' in subItem.child_link) {
                      return (
                        <NavLink
                          key={`${link.id}-${subItem.child_link.url}-${asText(subItem.child_name)}`}
                          component={PrismicLink}
                          field={subItem.child_link}
                          label={asText(subItem.child_name)}
                          styles={navLinkStyles}
                          onClick={handleNavLinkClick}
                        />
                      )
                    }
                    return undefined
                  })
                  .filter(Boolean)}
            </NavLink>
          </div>
        )
      }),
    [handleNavLinkClick, isDesktop, menu?.data.body, onButtonClick]
  )

  const cartQuantity = useMemo(
    () => cart?.items.reduce((prev, product) => prev + product.quantity, 0),
    [cart?.items]
  )

  const onUserClick = useCallback(() => {
    if (session?.user === undefined) {
      router.push(SIGN_IN_PAGE_PATH)
    }
  }, [router, session?.user])

  return (
    <div
      className={`
        container mx-auto grid grid-cols-3 items-center bg-neutral-50 py-4 lg:flex
      `}
    >
      {isDesktop ? undefined : (
        <div>
          <Burger opened={menuOpened} size="sm" onClick={toggleMenu} />
          <Drawer closeButtonProps={drawerCloseButtonProps} opened={menuOpened} onClose={closeMenu}>
            <nav>{menuItems}</nav>
            <Divider className="my-6" />
            <NavLink label="Sign in" rightSection={null} styles={navLinkStyles} />
            <NavLink label="Create an account" rightSection={null} styles={navLinkStyles} />
            <NavLink label="Scout Circle" rightSection={null} styles={navLinkStyles} />
            <NavLink label="Find a consultant" rightSection={null} styles={navLinkStyles} />
            <NavLink label="Become a consultant" rightSection={null} styles={navLinkStyles} />
          </Drawer>
        </div>
      )}
      <div className="mx-auto lg:mx-0 lg:flex lg:items-center lg:justify-between xl:gap-6">
        <Link href={HOME_PAGE_PATH}>
          <CompanyLogo size={isDesktop ? 'lg' : 'md'} />
        </Link>

        {isDesktop ? <nav className="flex">{menuItems}</nav> : undefined}
      </div>
      <div className="ml-auto flex items-center gap-1.5 xl:gap-3">
        {isDesktop ? (
          <>
            <Search className="!p-0" id="header-search-desktop" />
          </>
        ) : undefined}
        <ActionIcon className="text-neutral-900" onClick={onUserClick}>
          <UserIcon className="h-6 w-6" />
        </ActionIcon>
        <ActionIcon className="text-neutral-900" onClick={toggleCartOpen}>
          <Indicator>
            {cartQuantity ? (
              <Typography className="badge-info badge badge-sm indicator-item text-14 font-bold">
                {cartQuantity}
              </Typography>
            ) : undefined}
            <div className="grid h-5 w-5 place-items-end">
              <ShoppingCartIcon className="h-6 w-6" />
            </div>
          </Indicator>
        </ActionIcon>
      </div>
      <CartDrawer />
    </div>
  )
}
