import { useRef } from 'react'

import dynamic from 'next/dynamic'

import { useMediaQuery } from '@mantine/hooks'
import { clsx } from 'clsx'

import { useScrollDirection } from '@/core/hooks/use-scroll-direction'

import { StatePicker } from '../state-picker'

const Consultant = dynamic(() => import('./consultant').then(module => module.Consultant), {
  ssr: false,
})
const DesktopMenu = dynamic(() => import('./desktop').then(module => module.DesktopMenu))
const MobileMenu = dynamic(() => import('./mobile').then(module => module.MobileMenu))

export const Header = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const ref = useRef<HTMLElement | null>(null)
  const { direction, scrollTop } = useScrollDirection()
  const headerHeight = ref?.current?.clientHeight || 0

  return (
    <header
      ref={ref}
      className={clsx(
        'sticky top-0 z-20 h-[10.5rem] transition-all delay-150 duration-500 lg:h-52',
        direction === 'down' && scrollTop > headerHeight ? '-translate-y-52' : 'translate-y-0'
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
          <div className="flex flex-col">{isDesktop ? <DesktopMenu /> : <MobileMenu />}</div>
        </div>
      </div>
    </header>
  )
}
