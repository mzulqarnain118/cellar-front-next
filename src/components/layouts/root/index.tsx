import { ReactNode } from 'react'

import { clsx } from 'clsx'

import { SkipLink } from '@/components/skip-link'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

import { Footer } from './footer'
import { Header } from './header'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { shaderVisible } = useProcessStore()
  useCartQuery()

  return (
    <>
      <SkipLink />
      <Header />
      <div
        className={clsx(
          `
            invisible fixed inset-0 z-10 max-h-screen bg-black opacity-0 transition-all
          `,
          shaderVisible && '!visible opacity-50'
        )}
      />
      <main tabIndex={-1}>
        <div id="main">{children}</div>
      </main>
      <Footer />
    </>
  )
}
