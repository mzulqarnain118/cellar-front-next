import { useLayoutEffect, useState } from 'react'

import SingleWidgetManager from '@hubbox/single-widget-manager'
import type { MessageAndTopic } from '@hubbox/single-widget-manager/dist/types/types/topics'
import { HbWidgetModal } from '@hubbox/web-components'
// @ts-ignore
import { Orchestrator } from '@hubbox/web-components-orchestrator'

import { Input } from '@/core/components/input'

let singleWidgetManager: SingleWidgetManager | undefined
let orchestrator: Orchestrator | undefined
if (typeof window !== 'undefined') {
  singleWidgetManager = new SingleWidgetManager({
    deferRender: true,
    iframeParams: {
      configId: 'scoutandcellar',
      defaultLocale: 'en-US',
      locale: 'en-US',
    },
    // eslint-disable-next-line no-constant-condition
    iframeUrl: false
      ? SingleWidgetManager?.iframeUrls?.PRODUCTION || ''
      : SingleWidgetManager?.iframeUrls?.SANDBOX || '',
  })

  orchestrator = new Orchestrator({
    components: {
      modalComponent: new HbWidgetModal(),
    },
    selectors: {
      modalSelector: {
        insertPosition: 'afterend',
        selector: '.modal',
      },
    },
    singleWidgetManager,
  })
}

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

export const HoldAtLocationLocator = () => {
  const [searchValue, _setSearchValue] = useState('')

  const onConfirm = async (data: MessageAndTopic) => {
    const _addressData = data.message as { address: HubBoxAddress; id: string }
    // const stateData = states.find(state => state.abbreviation === addressData.address.region)

    // const street3 = {
    //   H: `.D2R.${addressData.id}.`, // H means HAL (with UID for UPS or 1 for SC)
    //   T: 'UPS', // T means Type (UPS or SC)
    // }

    // const address = {
    //   AddressID: 0,
    //   FirstName: userData.name.first,
    //   LastName: userData.name.last,
    //   Company: '',
    //   NickName: '',
    //   City: addressData.address.city,
    //   CountryName: 'United States',
    //   PostalCode: addressData.address.postcode,
    //   ProvinceAbbreviation: stateData?.abbreviation || 'AL',
    //   ProvinceID: stateData?.provinceId.toString() || '1',
    //   ProvinceName: stateData?.name || 'Alabama',
    //   Street1: addressData.address.street1,
    //   Street2: addressData.id.startsWith('U') ? `.D2R.${addressData.id}.`.substring(0, 50) : '',
    //   Street3: addressData.id.startsWith('U') ? JSON.stringify(street3).substring(0, 50) : '',
    //   Primary: false,
    //   Residential: false,
    // }

    // await setShippingMethodId(GROUND_SHIPPING_SHIPPING_METHOD_ID, false)
    // await setActiveShippingAddress(address, GROUND_SHIPPING_SHIPPING_METHOD_ID)

    // if (!hasUsableAddress && !allAddresses?.length) {
    //   const response = await createShippingAddress(address)
    //   if (response?.Success) {
    //     await getShippingAddressesAndCreditCards()
    //     await setActiveShippingAddress(response.Data.Value)
    //   } else {
    //     setErrorMessage(
    //       'There was an error creating your address. Please review and try again.' ||
    //         response?.Error.Message
    //     )
    //   }
    // }
    sessionStorage.removeItem(HAL_SEARCH_KEY)
  }

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      singleWidgetManager?.events.subscribe(
        singleWidgetManager?.topics.subscribe.COLLECT_POINT_CONFIRMED,
        onConfirm
      )
    }

    return () => {
      singleWidgetManager?.events.unsubscribe(
        singleWidgetManager?.topics.subscribe.COLLECT_POINT_CONFIRMED,
        onConfirm
      )
      singleWidgetManager?.resetMessageManager()
    }
  }, [])

  return (
    <>
      <form
        onSubmit={event => {
          event.preventDefault()
          sessionStorage.setItem(HAL_SEARCH_KEY, searchValue)
          orchestrator?.eventCallbacks.launchSearchSubmit(searchValue)
        }}
      >
        <Input
          id="hal-locator"
          label="Choose environmentally friendly shipping. Pick up at a location near you."
        />
      </form>
      <div className="modal" />
    </>
  )
}
