import { ParsedUrlQueryInput } from 'querystring'

import { useMemo } from 'react'

import { Url } from 'next/dist/shared/lib/router/router'
import NextLink, { LinkProps } from 'next/link'

import { useConsultantStore } from '@/lib/stores/consultant'

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode
  } & React.RefAttributes<HTMLAnchorElement>

const isParsedQueryInput = (
  query: string | ParsedUrlQueryInput | null | undefined
): query is ParsedUrlQueryInput =>
  query !== undefined && query !== null && typeof query === 'object' && typeof query !== 'string'

export const Link = ({ href: initialHref, ...rest }: Props) => {
  const { consultant } = useConsultantStore()

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
    const consultantUrl = searchParams.get('u')
    if (!consultantUrl && consultant.url) {
      searchParams.delete('u')
      searchParams.append('u', consultant.url)
    }
    if (pathname.startsWith('/wine')) {
      searchParams.set('page', '1')
    } else {
      searchParams.delete('page')
    }

    return {
      pathname,
      query: searchParams.toString(),
    }
  }, [initialHref, consultant])

  return (
    <NextLink
      as={href.pathname?.startsWith('/wine') ? href.pathname : undefined}
      href={href}
      {...rest}
    />
  )
}
