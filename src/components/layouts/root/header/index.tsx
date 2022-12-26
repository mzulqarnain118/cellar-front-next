import { StatePicker } from '../state-picker'

import { Consultant } from './consultant'
import { DesktopMenu } from './desktop'
import { MobileMenu } from './mobile'

export const Header = () => (
  <div className="relative top-0 left-0 z-10 w-full">
    <div className="pb-3 shadow-lg lg:pb-0">
      <div className="bg-primary-500 py-2 text-neutral-50">
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
      <header className="container mx-auto flex flex-col bg-neutral-50">
        <MobileMenu className="lg:hidden" />
        <DesktopMenu className="hidden lg:flex" />
      </header>
    </div>
  </div>
)
