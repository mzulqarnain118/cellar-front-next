import { ReactNode, useCallback } from 'react'

import { Link } from '@/components/link'

interface FooterLinkProps {
  children: ReactNode
  link: string
  target?: string
}

export const FooterLink = ({ children, link, target = '_self' }: FooterLinkProps) => {
  const handleExternalLinkClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(link, target)
    }
  }, [link, target])

  return link.startsWith('http') ? (
    <button className="hover:underline text-left !m-0" onClick={handleExternalLinkClick}>
      {children}
    </button>
  ) : (
    <Link className="!m-0 !p-0" href={link}>
      {children}
    </Link>
  )
}
