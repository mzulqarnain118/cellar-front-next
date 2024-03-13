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

    /**
     * * NOTE: I thought external links should indicate they are external in some way but I don't
     * * think Aparna would like it.
     */
    // const link = useMemo(
    //   () =>
    //     href.pathname?.startsWith('/') ? (
    //       <NextLink
    //         ref={ref}
    //         as={href.pathname?.startsWith('/wine') ? href.pathname : undefined}
    //         {...rest}
    //         className={clsx(
    //           'inline-flex gap-1',
    //           button &&
    //             `
    //               bg-primary-light hover:bg-primary-dark w-max py-3 px-4 rounded text-neutral-50
    //               inline-flex font-semibold items-center gap-1 no-underline transition-all
    //               hover:gap-2 hover:no-underline
    //             `,
    //           rest.className
    //         )}
    //         href={href}
    //       />
    //     ) : (
    //       <NextLink
    //         ref={ref}
    //         as={href.pathname?.startsWith('/wine') ? href.pathname : undefined}
    //         className={clsx(
    //           'inline-flex gap-1',
    //           button &&
    //             `
    //               bg-primary-light hover:bg-primary-dark w-max py-3 px-4 rounded text-neutral-50
    //               inline-flex font-semibold items-center gap-1 no-underline transition-all
    //               hover:gap-2 hover:no-underline
    //             `,
    //           rest.className
    //         )}
    //         href={href}
    //       >
    //         {rest.children}
    //         <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer" />
    //       </NextLink>
    //     ),
    //   [button, href, ref, rest]
    // )

    const link = useMemo(
      () => (
        <NextLink
          ref={ref}
          as={href.pathname?.startsWith('/wine') ? href.pathname : undefined}
          {...rest}
          className={clsx(
            'inline-flex gap-1',
            button &&
              `
                bg-primary-light hover:bg-primary-dark py-3 px-4 rounded text-neutral-50
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
