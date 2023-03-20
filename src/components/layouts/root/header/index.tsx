import { StatePicker } from '../state-picker'

import { Consultant } from './consultant'
import { DesktopMenu } from './desktop'
import { MobileMenu } from './mobile'

export const Header = () => (
  <header>
    <div className="relative top-0 left-0 z-20 w-full bg-neutral-50 text-neutral-900">
      <div className="shadow-lg">
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
