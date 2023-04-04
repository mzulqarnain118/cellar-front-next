import { ParsedUrlQueryInput } from 'querystring'

import { useMemo } from 'react'

import NextLink, { LinkProps } from 'next/link'

import { DISPLAY_CATEGORY } from '@/lib/constants/display-category'
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

  const href = useMemo(() => {
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
      searchParams.set('categories', DISPLAY_CATEGORY.Wine.toString())
      searchParams.set('limit', '16')
      searchParams.set('page', '1')
      searchParams.set('sort', 'relevant')
    } else {
      searchParams.delete('categories')
      searchParams.delete('limit')
      searchParams.delete('page')
      searchParams.delete('sort')
    }

    return {
      pathname,
      query: searchParams.toString(),
    }
  }, [initialHref, consultant])

  return <NextLink href={href} {...rest} />
}
