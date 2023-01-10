import { ReactNode } from 'react'

import { useCartQuery } from '@/lib/queries/cart'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  useCartQuery()

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
