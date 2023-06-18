import { useCallback, useMemo } from 'react'

import { Select, SelectProps, Skeleton } from '@mantine/core'
import { modals } from '@mantine/modals'
import { PrismicRichText } from '@prismicio/react'
import { useQueryClient } from '@tanstack/react-query'

import { PAGINATED_SEARCH_QUERY_KEY } from '@/features/search/queries'
import { useStateWarningsQuery } from '@/features/state-warning/queries'
import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY, useCartQuery } from '@/lib/queries/cart'
import { PAGINATED_PRODUCTS_QUERY_KEY, PRODUCTS_QUERY_KEY } from '@/lib/queries/products'
import { useStatesQuery } from '@/lib/queries/state'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { Cart, State } from '@/lib/types/index'
import { toastInfo } from '@/lib/utils/notifications'

interface StatePickerProps {
  popup?: boolean
}

/**
 * Renders a select menu with available shipping states listed.
 */
export const StatePicker = ({ popup = false }: StatePickerProps) => {
  const queryClient = useQueryClient()
  const [_, setCartStorage] = useCartStorage()
  const { data: states, isFetching, isLoading } = useStatesQuery()
  const { data: stateWarnings } = useStateWarningsQuery()
  const { data: cart } = useCartQuery()
  const { setShippingState, shippingState } = useShippingStateStore()

  const stateOptions = useMemo(
    () =>
      states?.map((state: State) => ({
        data: state,
        label: state.name,
        value: state.provinceID.toString(),
      })) || [],
    [states]
  )

  const handleStateChange: SelectProps['onChange'] = useCallback(
    (value: string) => {
      const newStateId = value
      const newState = states?.find(state => state.provinceID.toString() === newStateId)
      setShippingState(newState)
      setCartStorage(undefined)
      queryClient.invalidateQueries([...CART_QUERY_KEY, 48])
      queryClient.invalidateQueries([...PRODUCTS_QUERY_KEY])
      queryClient.invalidateQueries([...PAGINATED_PRODUCTS_QUERY_KEY])
      queryClient.invalidateQueries([PAGINATED_SEARCH_QUERY_KEY])

      const removedCartItems: Cart['items'] = []

      cart?.items.forEach(item => {
        const availability = item.availability?.filter(
          state => state.provinceId === newState?.provinceID && state.enabled
        )

        if (!availability || !availability.length) {
          removedCartItems.push(item)
        }
      })

      const removedString = removedCartItems.map(product => product.displayName).join(', ')
      if (removedString !== '') {
        toastInfo({
          message: `${removedString.replace(
            /<[^>]*>?/gm,
            ''
          )} has been removed from your cart because it is not available in the state you are
    shipping to.`,
        })
      }

      if (stateWarnings !== undefined) {
        const data = stateWarnings?.data.states.find(
          state => state.state?.toLowerCase() === newState?.abbreviation.toLowerCase()
        )

        if (data !== undefined) {
          modals.open({
            centered: true,
            children: (
              <div className="[&>*]:mb-2 [&>h3]:!h5">
                <PrismicRichText field={data?.warning} />
              </div>
            ),
            classNames: {
              title: '!text-2xl',
            },
            title: data?.modal_name,
          })
        }
      }
    },
    [cart?.items, queryClient, setCartStorage, setShippingState, stateWarnings, states]
  )

  const filter: SelectProps['filter'] = useCallback(
    (searchValue: string, item: { data: State; value: string }) =>
      item.data.name.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      item.data.abbreviation.toLowerCase().includes(searchValue.toLowerCase().trim()),
    []
  )

  const classNames: SelectProps['classNames'] = useMemo(
    () => ({
      input: popup
        ? 'w-full px-2 font-bold text-14'
        : 'w-full lg:w-auto bg-[#e6e0dd] font-bold border-0 p-0 text-14',
      item: 'bg-[]',
      root: 'flex flex-col lg:flex-row items-center gap-2 lg:grid lg:gap-0',
    }),
    [popup]
  )

  if (isFetching || isLoading) {
    return (
      <div className="flex items-center lg:grid">
        <Skeleton className="h-4 w-[3.625rem] lg:w-[10.3125rem]" />
        <Skeleton className="h-[1.875rem] w-[10.3125rem]" />
      </div>
    )
  }

  return (
    <Select
      searchable
      selectOnBlur
      withinPortal
      classNames={classNames}
      data={stateOptions}
      filter={filter}
      label={popup ? 'Select the state you are planning to ship to' : 'Shipping to'}
      size={popup ? 'sm' : 'xs'}
      value={shippingState.provinceID.toString()}
      onChange={handleStateChange}
    />
  )
}
