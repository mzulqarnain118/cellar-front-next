import { ReactNode } from 'react'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
)
