import { useCallback } from 'react'

import { Collapse, Radio } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { Button } from '@/core/components/button'
import { Input } from '@/core/components/input'
import { Typography } from '@/core/components/typogrpahy'
import {
  ABC_STORE_SHIPPING_METHOD_ID,
  GROUND_SHIPPING_SHIPPING_METHOD_ID,
  LOCAL_PICK_UP_SHIPPING_METHOD_ID,
} from '@/lib/constants/shipping-method'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'

export const PickUp = () => {
  const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
    useUpdateShippingMethodMutation()
  const [abcOpened, { close: closeAbc, toggle: toggleAbcOpened }] = useDisclosure(false)
  const [halOpened, { close: closeHal, toggle: toggleHalOpened }] = useDisclosure(false)
  const [lpuOpened, { close: closeLpu, toggle: toggleLpuOpened }] = useDisclosure(false)

  const handleLpuOpen = useCallback(() => {
    closeAbc()
    closeHal()
    toggleLpuOpened()
    updateShippingMethod({ shippingMethodId: LOCAL_PICK_UP_SHIPPING_METHOD_ID })
  }, [closeAbc, closeHal, toggleLpuOpened, updateShippingMethod])

  const handleHalOpen = useCallback(() => {
    closeAbc()
    closeLpu()
    toggleHalOpened()
    updateShippingMethod({ shippingMethodId: GROUND_SHIPPING_SHIPPING_METHOD_ID })
  }, [closeAbc, closeLpu, toggleHalOpened, updateShippingMethod])

  const handleAbcOpen = useCallback(() => {
    if (!abcOpened) {
      closeLpu()
      closeHal()
      toggleAbcOpened()
      updateShippingMethod({ shippingMethodId: ABC_STORE_SHIPPING_METHOD_ID })
    }
  }, [abcOpened, closeHal, closeLpu, toggleAbcOpened, updateShippingMethod])

  return (
    <div className="flex flex-col space-y-3">
      <Radio
        checked={lpuOpened}
        color="brand"
        disabled={isUpdatingShippingMethod}
        label="Scout &amp; Cellar, Local Pick Up in Dallas, Texas"
        size="md"
        onChange={handleLpuOpen}
      />

      <Collapse in={lpuOpened}>
        <div className="ml-9 space-y-4">
          <p className="text-14">
            <strong>
              HEADS UP! Orders will be ready for pick-up in 2 business days if placed before 11 AM
              CST today, and in 3 business days if placed after 11 AM CST today.
            </strong>
          </p>
          <div className="rounded border border-base-dark bg-[#fafafa] p-5">
            <Typography as="h3" className="!font-body !font-semibold" displayAs="h6">
              Scout & Cellar Local Pick Up
            </Typography>
            <p className="text-14">2261 Morgan Parkway</p>
            <p className="text-14">STE 180</p>
            <p className="text-14">Dallas, TX 75234</p>
          </div>
        </div>
      </Collapse>
      <Radio
        checked={halOpened}
        color="brand"
        disabled={isUpdatingShippingMethod}
        label="Pick up at a hold-at-location"
        size="md"
        onChange={handleHalOpen}
      />

      <Collapse in={halOpened}>{/* <HoldAtLocationLocator /> */}</Collapse>
      <Button
        className="mr-auto mt-6 p-0"
        disabled={isUpdatingShippingMethod}
        variant="link"
        onClick={handleAbcOpen}
      >
        Shipping to Alabama? Select an Alabama ABC store
      </Button>

      <Collapse in={abcOpened}>
        <Input id="abc" />
      </Collapse>
    </div>
  )
}
