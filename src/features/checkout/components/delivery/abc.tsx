import { useCallback, useMemo, useState } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { AutocompleteProps, Select } from '@mantine/core'
import { useSession } from 'next-auth/react'

import { Link } from '@/components/link'
import { ABC_STORE_SHIPPING_METHOD_ID } from '@/lib/constants/shipping-method'
import { useApplyCheckoutSelectionsMutation } from '@/lib/mutations/checkout/apply-selections'
import {
  useCheckoutActions,
  useCheckoutActiveCreditCard,
  useCheckoutSelectedPickUpAddress,
} from '@/lib/stores/checkout'

import { ABCStore, useAbcStoresQuery } from '../../queries/abc-stores'

interface ABC_Props {
  updateShippingMethod: any
}

export const ABC = ({ updateShippingMethod }: ABC_Props) => {
  const activeCreditCard = useCheckoutActiveCreditCard()
  const selectedPickUpAddress = useCheckoutSelectedPickUpAddress()
  const { data: session } = useSession()
  const { data: abcStores } = useAbcStoresQuery()
  const { mutate: applyCheckoutSelections } = useApplyCheckoutSelectionsMutation()
  const { setSelectedPickUpAddress, setActiveShippingAddress } = useCheckoutActions()
  const [value, setValue] = useState<string | null>(
    selectedPickUpAddress?.AddressID?.toString() || ''
  )

  const data = useMemo(
    () =>
      abcStores?.map(store => ({
        data: store,
        label: store.displayName,
        value: store.addressId.toString(),
      })) || [],
    [abcStores]
  )

  const description = useMemo(
    () => (
      <Link
        href="https://scoutandcellar.zendesk.com/hc/en-us/articles/360052168394"
        target="_blank"
      >
        Instructions
      </Link>
    ),
    []
  )

  const handleChange = useCallback(
    (value: string) => {
      updateShippingMethod({ shippingMethodId: ABC_STORE_SHIPPING_METHOD_ID })
      const store = abcStores?.find(abc => abc.addressId.toString() === value)

      if (store !== undefined) {
        const {
          addressId,
          city,
          displayName,
          postalCode,
          provinceAbbreviation,
          provinceId,
          provinceName,
          street1,
          street2,
        } = store
        setValue(addressId.toString())

        const address = {
          AddressID: addressId,
          City: city,
          Company: '',
          CountryName: 'United States',
          FirstName: session?.user?.name.first || '',
          LastName: session?.user?.name.last || '',
          NickName: displayName,
          PhoneNumber: '',
          PostalCode: postalCode,
          Primary: false,
          ProvinceAbbreviation: provinceAbbreviation,
          ProvinceID: provinceId.toString(),
          ProvinceName: provinceName,
          Residential: false,
          Street1: street1,
          Street2: street2,
          Street3: '',
        }

        setSelectedPickUpAddress(address)
        setActiveShippingAddress(address)
        applyCheckoutSelections({
          address,
          addressId,
          paymentToken: activeCreditCard?.PaymentToken,
        })
      } else {
        setValue('')
      }
    },
    [
      abcStores,
      activeCreditCard?.PaymentToken,
      applyCheckoutSelections,
      session?.user?.name.first,
      session?.user?.name.last,
      setSelectedPickUpAddress,
      setActiveShippingAddress,
    ]
  )

  const filter: AutocompleteProps['filter'] = useCallback(
    (searchValue: string, store: { data: ABCStore; label: string; value: string }) =>
      store.data.city.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.displayName.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.postalCode.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.provinceAbbreviation.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.provinceName.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.street1.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      store.data.street2.toLowerCase().includes(searchValue.toLowerCase().trim()),
    []
  )

  const rightSection = useMemo(() => {
    if (selectedPickUpAddress !== undefined) {
      return <CheckCircleIcon className="h-5 w-5 text-success" />
    }
  }, [selectedPickUpAddress])

  return (
    <Select
      searchable
      data={data}
      description={description}
      filter={filter}
      label="Select an ABC store to pick up"
      name="abc"
      rightSection={rightSection}
      value={value}
      onChange={handleChange}
    />
  )
}
