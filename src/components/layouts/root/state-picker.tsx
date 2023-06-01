import { useCallback, useMemo } from 'react'

import { Select, SelectProps, Skeleton } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'

import { useCartStorage } from '@/lib/hooks/use-cart-storage'
import { CART_QUERY_KEY } from '@/lib/queries/cart'
import { useStatesQuery } from '@/lib/queries/state'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { State } from '@/lib/types/index'

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
      queryClient.invalidateQueries([
        [...CART_QUERY_KEY, 48],
        [...CART_QUERY_KEY, parseInt(newStateId || '48')],
      ])
    },
    [queryClient, setCartStorage, setShippingState, states]
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
