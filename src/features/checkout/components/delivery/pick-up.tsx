import { useCallback, useEffect } from 'react'

import dynamic from 'next/dynamic'

import { Collapse, Radio, RadioProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { api } from '@/lib/api'
import {
  ABC_STORE_SHIPPING_METHOD_ID,
  GROUND_SHIPPING_SHIPPING_METHOD_ID,
  LOCAL_PICK_UP_SHIPPING_METHOD_ID,
} from '@/lib/constants/shipping-method'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method'
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards'
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutActiveShippingAddress,
  useCheckoutErrors,
  useCheckoutSelectedPickUpAddress,
  useCheckoutSelectedPickUpOption,
} from '@/lib/stores/checkout'

import { MORGAN_ADDRESS } from '../../constants/local-pickup-address'

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


export const PickUp = ({ refs, cartTotalData }: PickUpProps) => {
  const isLpuDisabled= process.env.NEXT_PUBLIC_DISABLED_LOCAL_PICK_UP === "true";
  const radioClassNames: RadioProps['classNames'] = {
  label: `text-14 ${isLpuDisabled ? 'cursor-not-allowed' : ''}`
    };
  const errors = useCheckoutErrors()
  const { setErrors, setSelectedPickUpOption, setActiveShippingAddress } = useCheckoutActions()
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
  const { setSelectedPickUpAddress } = useCheckoutActions()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()
  const { data: addressesAndCreditCards } = useAddressesAndCreditCardsQuery()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const activeShippingAddress = useCheckoutActiveShippingAddress()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()

  const { data: session } = useSession()

  const lpuOrderAddress = {
    ...MORGAN_ADDRESS,
    FirstName: session?.user?.name.first || '',
    LastName: session?.user?.name.last || '',
  }

  const getSCLocations = async () => {
    const response = await api('v2/checkout/GetLocalPickupData').json()
    return response?.Data?.[0] // Return the fetched data directly
  }

  const { data: localPickupData } = useQuery({
    queryFn: getSCLocations,
    queryKey: 'GetLocalPickupData',
  })

  const handleLpuOpen = useCallback(() => {
    closeAbc()
    closeHal()
    toggleLpuOpened()
    setSelectedPickUpOption('lpu')
    setErrors(prev => ({ ...prev, delivery: '' }))
    updateShippingMethod({ shippingMethodId: LOCAL_PICK_UP_SHIPPING_METHOD_ID })
    setSelectedPickUpAddress(lpuOrderAddress)
    setActiveShippingAddress(lpuOrderAddress)
    applyCheckoutSelections({
      addressId: lpuOrderAddress?.AddressID,
      paymentToken: activeCreditCard?.PaymentToken,
    })
  }, [
    addressesAndCreditCards,
    activeShippingAddress,
    closeAbc,
    closeHal,
    setErrors,
    setActiveShippingAddress,
    setSelectedPickUpOption,
    selectedPickUpAddress,
    setSelectedPickUpAddress,
    setSelectedPickUpAddress,
    toggleLpuOpened,
    updateShippingMethod,
  ])

  const handleHalOpen = useCallback(() => {
    closeAbc()
    closeLpu()
    toggleHalOpened()
    setSelectedPickUpOption('hal')
    setErrors(prev => ({ ...prev, delivery: '' }))
    //  shippingMethods?.[0]?.shippingMethodId
    updateShippingMethod({
      shippingMethodId: GROUND_SHIPPING_SHIPPING_METHOD_ID,
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
        if(isLpuDisabled &&  selectedPickUpOption === 'lpu') return
      selectedPickUpOption && pickupOptions[selectedPickUpOption]()
    } else if (!session?.user.isGuest) {
      isLpuDisabled ? pickupOptions.hal() :  pickupOptions.lpu()
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
        disabled={isLpuDisabled || isUpdatingShippingMethod}
        label={isLpuDisabled ? 'Scout & Cellar, Local Pick Up in Dallas, Texas - No Longer Available effective 5/17/25' : `Scout &amp; Cellar, Local Pick Up in Dallas, Texas`}
        size="sm"
        onChange={handleLpuOpen}
      />

      <Collapse in={lpuOpened}>
        <div className="ml-9 space-y-4">
          <p className="text-14">
            <Typography as="strong">
              HEADS UP! We’re upgrading our Local Pickup service to give you a more seamless
              experience. During this transition, orders will be ready for pickup within 5-7
              business days. Feel free to give us a call at 972-457-1667 to confirm your order or
              check on inventory.
            </Typography>
          </p>
          <div className="rounded border border-base-dark bg-[#fafafa] p-5">
            <Typography as="h3" className="!font-body !font-semibold" displayAs="h6">
              Scout & Cellar Local Pick Up
            </Typography>
            <p className="text-14">{localPickupData?.Address1 ?? ''}</p>
            <p className="text-14">{localPickupData?.Address2 ?? ''}</p>
            <p className="text-14">{`${localPickupData?.City?.length ? localPickupData?.City+',' : ''} ${
              localPickupData?.Province ?? ''
            }  ${localPickupData?.PostalCode ?? ''}`}</p>
          </div>
        </div>
      </Collapse>
      <Radio
        ref={refs.halRef}
        checked={halOpened}
        classNames={radioClassNames}
        color="brand"
        disabled={isUpdatingShippingMethod}
        label=<p>
          Pick up at a <b>UPS</b> hold-at-location <b>(Ships via UPS)</b>
        </p>
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
