import { useCallback, useMemo } from 'react'

import { ChevronDownIcon, HeartIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import {
  ActionIcon,
  Burger,
  Button,
  Divider,
  Drawer,
  Indicator,
  Menu,
  ModalBaseCloseButtonProps,
  NavLink,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { UseMediaQueryOptions } from '@mantine/hooks/lib/use-media-query/use-media-query'
import { asText } from '@prismicio/helpers'
import { PrismicLink } from '@prismicio/react'

import { CompanyLogo } from '@/components/company-logo'
import { Link } from '@/components/link'
import { Search } from '@/components/search'
import { CART_PAGE_PATH, HOME_PAGE_PATH } from '@/lib/paths'
import { useCartQuery } from '@/lib/queries/cart'
import { useNavigationQuery } from '@/lib/queries/header'

const drawerCloseButtonProps: ModalBaseCloseButtonProps = {
  size: 'md',
}
const navLinkStyles = { label: { fontWeight: 400, letterSpacing: '0.05em' } }
const mediaQueryOptions: UseMediaQueryOptions = { getInitialValueInEffect: false }

export const Navigation = () => {
  const isDesktop = useMediaQuery('(min-width: 64em)', true, mediaQueryOptions)
  const { data: cart } = useCartQuery()
  const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false)
  const { data: menu, isError: _, isFetching: _f, isLoading: _l } = useNavigationQuery()

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
                  <Button className="py-0" size="md" variant="subtle">
                    {asText(link.primary.name)}
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
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
                component={PrismicLink}
                field={link.primary.link}
                size="md"
                variant="subtle"
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
    [handleNavLinkClick, isDesktop, menu?.data.body]
  )

  const cartQuantity =
    useMemo(
      () => cart?.items.reduce((prev, product) => prev + product.quantity, 0),
      [cart?.items]
    ) || 0

  return (
    <div
      className={`
        container mx-auto grid grid-cols-3 items-center bg-neutral-50 py-4 lg:flex
      `}
    >
      {isDesktop ? undefined : (
        <div>
          <div className="flex gap-1.5">
            <Burger opened={menuOpened} size="sm" onClick={toggleMenu} />
            <ActionIcon className="text-neutral-900">
              <HeartIcon className="h-5 w-5" />
            </ActionIcon>
          </div>

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
            <ActionIcon className="text-neutral-900">
              <HeartIcon className="h-5 w-5" />
            </ActionIcon>
          </>
        ) : undefined}
        <ActionIcon className="text-neutral-900">
          <UserIcon className="h-5 w-5" />
        </ActionIcon>
        <ActionIcon className="text-neutral-900" component={Link} href={CART_PAGE_PATH}>
          <Indicator inline color="brand" label={cartQuantity} size={16}>
            <ShoppingCartIcon className="h-5 w-5" />
          </Indicator>
        </ActionIcon>
      </div>
    </div>
  )
}
