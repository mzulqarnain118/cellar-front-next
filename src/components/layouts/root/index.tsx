/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react'

import { clsx } from 'clsx'

import { SkipLink } from '@/components/skip-link'
import { useCartQuery } from '@/lib/queries/cart'
import { useProcessStore } from '@/lib/stores/process'

import { Footer } from './footer'
import { Header } from './header'
import { CartDrawer } from './header/cart-drawer'

interface RootLayoutProps {
  children: ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  const { shaderVisible } = useProcessStore()
  useCartQuery()

  return (
    <div className="drawer drawer-end">
      <input className="drawer-toggle" id="cart-drawer" type="checkbox" />
      <div className="drawer-content" id="root-element">
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
      </div>
      <div className="drawer-side">
        <label className="drawer-overlay" htmlFor="cart-drawer"></label>
        <div className="w-100 bg-neutral-100">
          <CartDrawer />
        </div>
      </div>
    </div>
  )
}
