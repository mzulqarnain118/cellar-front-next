import { useCallback, useMemo } from 'react'

import { Select, SelectProps } from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'

import { CART_QUERY_KEY } from '@/lib/queries/cart'
import { useStatesQuery } from '@/lib/queries/state'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { State } from '@/lib/types/index'

const classNames = {
  input: 'bg-[#e6e0dd] font-bold border-0 p-0 text-14',
  root: 'flex items-center gap-2 lg:grid lg:gap-0',
}

/**
 * Renders a select menu with available shipping states listed.
 */
export const StatePicker = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries(CART_QUERY_KEY)
    },
    [queryClient, setShippingState, states]
  )

  const filter: SelectProps['filter'] = useCallback(
    (searchValue: string, item: { data: State; value: string }) =>
      item.data.name.toLowerCase().includes(searchValue.toLowerCase().trim()) ||
      item.data.abbreviation.toLowerCase().includes(searchValue.toLowerCase().trim()),
    []
  )

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse flex-col space-y-2">
        <div className="h-6 w-28 rounded bg-neutral-200" />
      </div>
    )
  }

  return (
    <Select
      searchable
      classNames={classNames}
      data={stateOptions}
      filter={filter}
      label="Shipping to"
      size="xs"
      value={shippingState.provinceID.toString()}
      onChange={handleStateChange}
    />
  )
}
