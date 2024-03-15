import { useCallback, useEffect } from 'react'

import dynamic from 'next/dynamic'

import { Collapse, Radio, RadioProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import {
  ABC_STORE_SHIPPING_METHOD_ID,
  GROUND_SHIPPING_SHIPPING_METHOD_ID,
  LOCAL_PICK_UP_SHIPPING_METHOD_ID,
} from '@/lib/constants/shipping-method'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import { useCheckoutActions, useCheckoutErrors, useCheckoutSelectedPickUpOption } from '@/lib/stores/checkout'

import { ABC } from './abc'

import { DeliveryRefs } from '.'

const HoldAtLocationLocator = dynamic(
  () => import('./hal').then(module => module.HoldAtLocationLocator),
  { ssr: false }
)

interface PickUpProps {
  refs: DeliveryRefs
  cartTotalData: any
}

const radioClassNames: RadioProps['classNames'] = { label: 'text-14' }

export const PickUp = ({ refs
  , cartTotalData }: PickUpProps) => {
  const errors = useCheckoutErrors()
  const { setErrors, setSelectedPickUpOption } = useCheckoutActions()
  const { mutate: updateShippingMethod, isLoading: isUpdatingShippingMethod } =
    useUpdateShippingMethodMutation()
  const { data: shippingMethods } = useShippingMethodsQuery()
  const [abcOpened, { close: closeAbc, toggle: toggleAbcOpened }] = useDisclosure(
    cartTotalData?.shipping.methodId === ABC_STORE_SHIPPING_METHOD_ID
  )
  const [halOpened, { close: closeHal, toggle: toggleHalOpened }] = useDisclosure(false)
  const [lpuOpened, { close: closeLpu, toggle: toggleLpuOpened }] = useDisclosure(
    cartTotalData?.shipping.methodId === LOCAL_PICK_UP_SHIPPING_METHOD_ID
  )
  const selectedPickUpOption = useCheckoutSelectedPickUpOption()

  console.log("🚀 ~ selectedPickUpOption:", selectedPickUpOption)

  const { data: session } = useSession()

  const handleLpuOpen = useCallback(() => {
    closeAbc()
    closeHal()
    toggleLpuOpened()
    setSelectedPickUpOption('lpu')
    setErrors(prev => ({ ...prev, delivery: '' }))
    updateShippingMethod({ shippingMethodId: LOCAL_PICK_UP_SHIPPING_METHOD_ID })
  }, [
    closeAbc,
    closeHal,
    setErrors,
    setSelectedPickUpOption,
    toggleLpuOpened,
    updateShippingMethod,
  ])

  const handleHalOpen = useCallback(() => {
    closeAbc()
    closeLpu()
    toggleHalOpened()
    setSelectedPickUpOption('hal')
    setErrors(prev => ({ ...prev, delivery: '' }))
    updateShippingMethod({
      shippingMethodId:
        shippingMethods?.[0]?.shippingMethodId || GROUND_SHIPPING_SHIPPING_METHOD_ID,
    })
  }, [
    closeAbc,
    closeLpu,
    setErrors,
    setSelectedPickUpOption,
    shippingMethods,
    toggleHalOpened,
    updateShippingMethod,
  ])

  const handleAbcOpen = useCallback(() => {
    if (!abcOpened) {
      closeLpu()
      closeHal()
      toggleAbcOpened()
      setSelectedPickUpOption('abc')
      setErrors(prev => ({ ...prev, delivery: '' }))
      updateShippingMethod({ shippingMethodId: ABC_STORE_SHIPPING_METHOD_ID })
    }
  }, [
    abcOpened,
    closeHal,
    closeLpu,
    setErrors,
    setSelectedPickUpOption,
    toggleAbcOpened,
    updateShippingMethod,
  ])

  const pickupOptions = { lpu: handleLpuOpen, hal: handleHalOpen, abc: handleAbcOpen }

  useEffect(() => {

    if (session?.user.isGuest) {
      selectedPickUpOption && pickupOptions[selectedPickUpOption]()
    }
  }, [])

  return (
    <div className="flex flex-col space-y-3">
      {errors?.delivery ? (
        <Typography className="text-error">{errors.delivery}</Typography>
      ) : undefined}
      <Radio
        checked={lpuOpened}
        classNames={radioClassNames}
        color="brand"
        disabled={isUpdatingShippingMethod}
        label="Scout &amp; Cellar, Local Pick Up in Dallas, Texas"
        size="sm"
        onChange={handleLpuOpen}
      />

      <Collapse in={lpuOpened}>
        <div className="ml-9 space-y-4">
          <p className="text-14">
            <Typography as="strong">
              HEADS UP! Orders will be ready for pick-up in 2 business days if placed before 11 AM
              CST today, and in 3 business days if placed after 11 AM CST today.
            </Typography>
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
        ref={refs.halRef}
        checked={halOpened}
        classNames={radioClassNames}
        color="brand"
        disabled={isUpdatingShippingMethod}
        label="Pick up at a hold-at-location"
        size="sm"
        onChange={handleHalOpen}
      />
      <Collapse in={halOpened}>
        <HoldAtLocationLocator ref={refs.halRef} />
      </Collapse>
      <Button
        className="mr-auto mt-6 p-0"
        disabled={isUpdatingShippingMethod}
        variant="link"
        onClick={handleAbcOpen}
      >
        Shipping to Alabama? Select an Alabama ABC store
      </Button>

      <Collapse in={abcOpened}>
        <ABC updateShippingMethod={updateShippingMethod} />
      </Collapse>
    </div>
  )
}
