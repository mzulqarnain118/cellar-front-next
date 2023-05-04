import { useState } from 'react'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Collapse, Tabs } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'
import { useCheckoutTabs } from '@/lib/stores/checkout'

import { PickUp } from './pick-up'
import { ShipToHome } from './ship-to-home'

const tabsClassNames = { tabLabel: 'text-md' }

export const Delivery = () => {
  const { completedTabs } = useCheckoutTabs()
  const isComplete = completedTabs.includes('contact-information')
  const [opened, { toggle }] = useDisclosure(!isComplete)
  const [value, setValue] = useState<string | null>('shipToHome')

  return (
    <>
      <div
        className={clsx(
          'flex cursor-pointer items-center justify-between rounded p-4',
          !isComplete && '!cursor-not-allowed'
        )}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isComplete) {
            toggle()
          }
        }}
        onKeyDown={() => {
          if (isComplete) {
            toggle()
          }
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          2. Delivery
        </Typography>
        <ChevronDownIcon className="h-6 w-6" />
      </div>

      <Collapse className="!m-0 p-4" in={opened} transitionDuration={300}>
        <div>
          <Tabs
            classNames={tabsClassNames}
            color="dark"
            keepMounted={false}
            value={value}
            variant="pills"
            onTabChange={setValue}
          >
            <Tabs.List grow className="h-14 rounded border border-base-dark">
              <Tabs.Tab className="font-bold uppercase" value="shipToHome">
                Ship to home
              </Tabs.Tab>
              <Tabs.Tab className="font-bold uppercase" value="pickUp">
                Pick up
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel className="mt-4" value="shipToHome">
              <ShipToHome />
            </Tabs.Panel>
            <Tabs.Panel className="mt-4" value="pickUp">
              <PickUp />
            </Tabs.Panel>
          </Tabs>
        </div>
      </Collapse>
    </>
  )
}
