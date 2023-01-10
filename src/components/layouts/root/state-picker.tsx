import { ChangeEvent, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { CART_QUERY_KEY } from '@/lib/queries/cart'
import { useStatesQuery } from '@/lib/queries/state'
import { useShippingStateStore } from '@/lib/stores/shipping-state'
import { State } from '@/lib/types/index'

/**
 * Renders a select menu with available shipping states listed.
 */
export const StatePicker = () => {
  const queryClient = useQueryClient()
  const { data: states, isFetching, isLoading } = useStatesQuery()
  const { setShippingState, shippingState } = useShippingStateStore()

  const stateOptions = useMemo(
    () =>
      states?.map((state: State) => (
        <option key={state.abbreviation} className="capitalize" value={state.provinceID}>
          {state.name}
        </option>
      )),
    [states]
  )

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newProvinceId = parseInt(event.target.value)
    const newShippingState = states?.find(state => state.provinceID === newProvinceId)
    setShippingState(newShippingState)
    queryClient.invalidateQueries(CART_QUERY_KEY)
  }

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse flex-col space-y-2">
        <div className="h-2 w-20 rounded bg-primary-300" />
        <div className="h-2 w-28 rounded bg-primary-300" />
      </div>
    )
  }

  return (
    <select
      aria-label="Shipping State"
      aria-labelledby="shipping-state-label"
      className={`
        cursor-pointer appearance-none rounded bg-primary-500 hover:underline
        focus:outline-dashed focus:outline-1 focus:outline-offset-1 focus:outline-neutral-50
      `}
      title="Change my shipping state"
      value={shippingState?.provinceID || 48} // * NOTE: Default to Texas if it's falsy.
      onChange={handleStateChange}
    >
      {stateOptions}
    </select>
  )
}
