import { useRef } from 'react'

import dynamic from 'next/dynamic'

import { clsx } from 'clsx'

import { useScrollDirection } from '@/core/hooks/use-scroll-direction'

import { StatePicker } from '../state-picker'

import { DesktopMenu } from './desktop'
import { MobileMenu } from './mobile'

const Consultant = dynamic(() => import('./consultant').then(module => module.Consultant), {
  ssr: false,
})

export const Header = () => {
  const ref = useRef<HTMLElement | null>(null)
  const scrollDirection = useScrollDirection()

  return (
    <header
      ref={ref}
      className={clsx(
        'sticky z-20 h-[10.5rem] transition-all delay-150 duration-500 lg:h-52',
        scrollDirection === 'down' ? '-top-52' : 'top-0'
      )}
    >
      <div className="relative top-0 left-0 z-20 w-full bg-neutral-50 text-neutral-900">
        <div className="shadow">
          <div className="flex h-12 items-center border-b border-neutral-300">
            <div className="container mx-auto flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span id="shipping-state-label">My Shipping State</span>
                <div className="text-sm font-bold">
                  <StatePicker />
                </div>
              </div>
              <Consultant />
            </div>
          </div>
          <div className="flex flex-col">
            <MobileMenu />
            <DesktopMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
