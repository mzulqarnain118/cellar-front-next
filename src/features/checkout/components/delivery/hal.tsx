import { ChangeEvent, forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import SingleWidgetManager from '@hubbox/single-widget-manager';
// @ts-ignore
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';

import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { useCreateAddressMutation } from '@/lib/mutations/address/create';
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections';
import { useUpdateShippingMethodMutation } from '@/lib/mutations/checkout/update-shipping-method';
import { useAddressesAndCreditCardsQuery } from '@/lib/queries/checkout/addreses-and-credit-cards';
import { useShippingMethodsQuery } from '@/lib/queries/checkout/shipping-methods';
import { useStatesQuery } from '@/lib/queries/state';
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutSelectedPickUpAddress,
} from '@/lib/stores/checkout';

// let singleWidgetManager: SingleWidgetManager | undefined
// let orchestrator: Orchestrator | undefined
// if (typeof window !== 'undefined') {
//   singleWidgetManager = new SingleWidgetManager({
//     deferRender: true,
//     iframeParams: {
//       configId: 'scoutandcellar',
//       defaultLocale: 'en-US',
//       locale: 'en-US',
//     },
//     iframeUrl:
//       process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'
//         ? SingleWidgetManager?.iframeUrls?.PRODUCTION || ''
//         : SingleWidgetManager?.iframeUrls?.SANDBOX || '',
//   })

//   orchestrator = new Orchestrator({
//     components: {
//       modalComponent: new HbWidgetModal(),
//     },
//     selectors: {
//       modalSelector: {
//         insertPosition: 'afterend',
//         selector: '.modal',
//       },
//     },
//     singleWidgetManager,
//   })
// }

interface HubBoxAddress {
  city: string
  country: string
  county: string
  postcode: string
  region: string
  street1: string
  street2: string
}

const HAL_SEARCH_KEY = 'hal-search'

export const HoldAtLocationLocator = forwardRef<HTMLInputElement>((_props, ref) => {
  const { data: addressesAndCreditCards } = useAddressesAndCreditCardsQuery()
  const { mutate: createAddress } = useCreateAddressMutation()
  const { mutate: updateShippingMethod } = useUpdateShippingMethodMutation()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const { data: states } = useStatesQuery()
  const { data: shippingMethods } = useShippingMethodsQuery()
  const { data: session } = useSession()
  const activeCreditCard = useCheckoutActiveCreditCard()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()
  const { setSelectedPickUpAddress } = useCheckoutActions()
  const widgetContainer = useRef<HTMLDivElement>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const singleWidgetManager = new SingleWidgetManager({
    deferRender: true,
    iframeUrl: process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'
      ? SingleWidgetManager?.iframeUrls?.PRODUCTION || ''
      : SingleWidgetManager?.iframeUrls?.SANDBOX || '',
    iframeParams: {
      configId: "scoutandcellar",
      defaultLocale: "en-US",
      locale: "en-US",
    },
  });

  singleWidgetManager.events.subscribe(
    singleWidgetManager.topics.subscribe.COLLECT_POINT_SELECTED,
    (payload) => {
      console.log("COLLECT_POINT_SELECTED", payload);
    }
  );

  singleWidgetManager.events.subscribe(
    singleWidgetManager.topics.subscribe.SEARCH_REQUEST,
    (payload) => {
      console.log("COLLECT_POINT_SELECTED", payload);
    }
  );

  useEffect(() => {
    widgetContainer.current?.appendChild(singleWidgetManager.iframeElem);
  }, []);
  // const primaryShippingMethod = useMemo(() => shippingMethods?.[0], [shippingMethods])
  // const value = useMemo(
  //   () =>
  //     selectedPickUpAddress !== undefined
  //       ? `${selectedPickUpAddress.Street1}, ${selectedPickUpAddress.City}, ${selectedPickUpAddress.ProvinceAbbreviation} ${selectedPickUpAddress.PostalCode}`
  //       : '',
  //   [selectedPickUpAddress]
  // )

  const [searchValue, setSearchValue] = useState()

  const onSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }, [])

  // const onConfirm = useCallback(
  //   async (data: MessageAndTopic) => {
  //     const addressData = data.message as { address: HubBoxAddress; id: string }
  //     const stateData = states?.find(state => state.abbreviation === addressData.address.region)

  //     const street3 = {
  //       H: `.D2R.${addressData.id}.`, // H means HAL (with UID for UPS or 1 for SC)
  //       T: 'UPS', // T means Type (UPS or SC)
  //     }

  //     const address = {
  //       AddressID: 0,
  //       City: addressData.address.city,
  //       Company: '',
  //       CountryName: 'United States',
  //       FirstName: session?.user?.name.first || '',
  //       LastName: session?.user?.name.last || '',
  //       NickName: '',
  //       PhoneNumber: '',
  //       PostalCode: addressData.address.postcode,
  //       Primary: false,
  //       ProvinceAbbreviation: stateData?.abbreviation || 'AL',
  //       ProvinceID: stateData?.provinceID.toString() || '1',
  //       ProvinceName: stateData?.name || 'Alabama',
  //       Residential: false,
  //       Street1: addressData.address.street1,
  //       Street2: addressData.id.startsWith('U') ? `.D2R.${addressData.id}.`.substring(0, 50) : '',
  //       Street3: addressData.id.startsWith('U') ? JSON.stringify(street3).substring(0, 50) : '',
  //     }

  //     updateShippingMethod({
  //       shippingMethodId:
  //         primaryShippingMethod?.shippingMethodId || GROUND_SHIPPING_SHIPPING_METHOD_ID,
  //     })
  //     applyCheckoutSelections({
  //       addressId: address.AddressID,
  //       paymentToken: activeCreditCard?.PaymentToken,
  //     })

  //     if (!addressesAndCreditCards?.addresses.length) {
  //       createAddress({ address })
  //     }

  //     setSelectedPickUpAddress(address)
  //     sessionStorage.removeItem(HAL_SEARCH_KEY)
  //     setSearchValue(
  //       `${address.Street1}, ${address.City}, ${address.ProvinceAbbreviation} ${address.PostalCode}`
  //     )
  //   },
  //   [
  //     activeCreditCard?.PaymentToken,
  //     addressesAndCreditCards?.addresses.length,
  //     applyCheckoutSelections,
  //     createAddress,
  //     primaryShippingMethod?.shippingMethodId,
  //     session?.user?.name.first,
  //     session?.user?.name.last,
  //     setSelectedPickUpAddress,
  //     states,
  //     updateShippingMethod,
  //   ]
  // )

  // useLayoutEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     singleWidgetManager?.events.subscribe(
  //       singleWidgetManager?.topics.subscribe.COLLECT_POINT_CONFIRMED,
  //       onConfirm
  //     )
  //   }

  //   return () => {
  //     singleWidgetManager?.events.unsubscribe(
  //       singleWidgetManager?.topics.subscribe.COLLECT_POINT_CONFIRMED,
  //       onConfirm
  //     )
  //     singleWidgetManager?.resetMessageManager()
  //   }
  // }, [onConfirm])

  return (
    <>
      {opened && (
        <Modal open opened={opened} title="Find a location near you" onClose={close}>
          Choose environmentally friendly shipping 🌱
          <div ref={widgetContainer}></div>
        </Modal>
      )}
      <form
        onSubmit={event => {
          event.preventDefault()
          open()

          sessionStorage.setItem(HAL_SEARCH_KEY, searchValue)
          singleWidgetManager.events.emit(
            singleWidgetManager.topics.emit.MAP_SEARCH_QUERY,
            searchValue
          );

          singleWidgetManager.events.emit(
            singleWidgetManager.topics.emit.RESET_STATE
          );
          // orchestrator?.eventCallbacks.launchSearchSubmit(searchValue)
        }}
      >
        <Input
          ref={ref}
          label="Choose environmentally friendly shipping. Pick up at a location near you."
          name="halLocator"
          placeholder="Enter zip code"
          right={<Button dark className="h-10 rounded-l-none" size="sm" type='submit'>
            Search
          </Button>}
          size="sm"
          value={searchValue}
          onChange={onSearchChange}
        />
      </form>
    </>
  )
})

HoldAtLocationLocator.displayName = 'HoldAtLocationLocator'
