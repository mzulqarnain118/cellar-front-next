import { ParsedUrlQueryInput } from 'querystring'

import { forwardRef, useMemo } from 'react'

import { Url } from 'next/dist/shared/lib/router/router'
import NextLink, { LinkProps } from 'next/link'

import { clsx } from 'clsx'

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    button?: boolean
    children?: React.ReactNode
  } & React.RefAttributes<HTMLAnchorElement>

const isParsedQueryInput = (
  query: string | ParsedUrlQueryInput | null | undefined
): query is ParsedUrlQueryInput =>
  query !== undefined && query !== null && typeof query === 'object' && typeof query !== 'string'

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ button = false, href: initialHref, ...rest }: Props, ref) => {
    const href: Url = useMemo(() => {
      const pathname = typeof initialHref === 'string' ? initialHref : initialHref.pathname || ''
      const query = typeof initialHref === 'string' ? undefined : initialHref.query

      if (pathname.includes('#')) {
        return {
          pathname,
        }
      }

      if (isParsedQueryInput(query)) {
        return {
          pathname,
          query: { ...query },
        }
      }

      const searchParams = new URLSearchParams()
      if (!pathname.startsWith('/wine')) {
        searchParams.delete('page')
      }

      return {
        pathname,
        query: searchParams.toString(),
      }
    }, [initialHref])

    const link = useMemo(
      () => (
        <NextLink
          ref={ref}
          as={
            href.pathname?.startsWith('/wine')
              ? href.pathname
              : href.pathname?.includes('?change=true')
              ? decodeURIComponent(href.pathname)
              : undefined
          }
          {...rest}
          className={clsx(
            'inline-flex gap-1',
            button &&
              ` ${
                href.pathname === '/test-sustainability'
                  ? 'bg-[#000]'
                  : 'bg-primary-light hover:bg-primary-dark'
              } py-3 px-4 rounded text-neutral-50
                inline-flex font-semibold items-center gap-1 no-underline transition-all
                hover:gap-2 hover:no-underline max-w-80
              `,
            rest.className
          )}
          href={href}
        />
      ),
      [button, href, ref, rest]
    )

    return link
  }
)

Link.displayName = 'Link'
