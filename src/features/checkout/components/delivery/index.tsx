import { MutableRefObject, memo, useCallback, useEffect, useMemo, useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Collapse, Tabs } from '@mantine/core'
import { clsx } from 'clsx'
import { useSession } from 'next-auth/react'

import { Typography } from '@/core/components/typogrpahy'
import { GROUND_SHIPPING_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import { useCheckoutActions, useCheckoutIsPickUp } from '@/lib/stores/checkout'

import { GuestAddress } from './guest-address'
import { PickUp } from './pick-up'
import { ShipToHome } from './ship-to-home'

const tabsClassNames = { tabLabel: 'text-md' }

export interface DeliveryRefs {
  abcRef: MutableRefObject<HTMLInputElement | null>
  halRef: MutableRefObject<HTMLInputElement | null>
  shippingAddressRef: MutableRefObject<HTMLInputElement | null>
  shippingMethodRef: MutableRefObject<HTMLInputElement | null>
}

interface DeliveryProps {
  opened: boolean
  refs: DeliveryRefs
  toggle: () => void
}

export const Delivery = memo(({ opened, refs, toggle }: DeliveryProps) => {
  const isPickUp = useCheckoutIsPickUp()
  const { data: shippingMethods } = useShippingMethodsQuery()
  const { setIsPickUp, setSelectedPickUpOption } = useCheckoutActions()
  const { mutate: updateShippingMethod } = useUpdateShippingMethodMutation()
  const [value, setValue] = useState<string | null>(isPickUp ? 'pickUp' : 'shipToHome')
  const { data: session } = useSession()
  const isGuest = useMemo(() => session?.user?.isGuest || false, [session?.user?.isGuest])

  const handleTabChange = useCallback(
    (tab: string) => {
      setValue(tab)
      if (tab === 'shipToHome' && value !== 'shipToHome') {
        updateShippingMethod({
          shippingMethodId:
            shippingMethods?.[0]?.shippingMethodId || GROUND_SHIPPING_SHIPPING_METHOD_ID,
        })
      }
    },
    [shippingMethods, updateShippingMethod, value]
  )

  useEffect(() => {
    setIsPickUp(value === 'pickUp')
  }, [setIsPickUp, setSelectedPickUpOption, value])

  return (
    <>
      <div
        className={clsx('flex cursor-pointer items-center justify-between rounded p-4')}
        role="button"
        tabIndex={0}
        onClick={() => {
          toggle()
        }}
        onKeyDown={event => {
          if (event.key === 'Escape' || event.key === 'Space') {
            toggle()
          }
        }}
      >
        <Typography noSpacing as="h2" displayAs="h5">
          2. Delivery
        </Typography>
        {opened ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
      </div>

      <Collapse className="!m-0 p-4" in={opened} transitionDuration={300}>
        <div>
          <Tabs
            classNames={tabsClassNames}
            color="dark"
            keepMounted={false}
            value={value}
            variant="pills"
            onTabChange={handleTabChange}
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
              {isGuest ? (
                <GuestAddress shippingAddressRef={refs.shippingAddressRef} />
              ) : (
                <ShipToHome refs={refs} />
              )}
            </Tabs.Panel>
            <Tabs.Panel className="mt-4" value="pickUp">
              <PickUp refs={refs} />
            </Tabs.Panel>
          </Tabs>
        </div>
      </Collapse>
    </>
  )
})

Delivery.displayName = 'Delivery'
