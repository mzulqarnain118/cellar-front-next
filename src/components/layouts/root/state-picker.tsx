import { useCallback, useMemo, useState } from 'react'

import { Combobox } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState(
    shippingState || states?.[0] || ({ abbreviation: 'TX', name: 'Texas', provinceID: 48 } as State)
  )

  const filteredStates = useMemo(
    () =>
      searchQuery === ''
        ? states
        : states?.filter(
            state =>
              state.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
              state.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
    [searchQuery, states]
  )

  const stateOptions = useMemo(
    () =>
      filteredStates?.map((state: State) => (
        <Combobox.Option
          key={state.abbreviation}
          className={`
            py-2 px-3 capitalize ui-active:bg-brand
            ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-800
          `}
          value={state}
        >
          {state.name}
        </Combobox.Option>
      )),
    [filteredStates]
  )

  const handleStateChange = useCallback(
    (value: State) => {
      setSelectedState(value)
      setShippingState(value)
      queryClient.invalidateQueries(CART_QUERY_KEY)
    },
    [queryClient, setShippingState]
  )

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse flex-col space-y-2">
        <div className="h-6 w-28 rounded bg-neutral-200" />
      </div>
    )
  }

  return (
    <Combobox value={selectedState} onChange={handleStateChange}>
      <Combobox.Input
        className="bg-neutral-50"
        displayValue={(state: State | undefined) => state?.name || ''}
        onChange={event => setSearchQuery(event.target.value)}
      />
      <div className="absolute">
        <Combobox.Options
          className={clsx(
            'relative z-10 max-h-56 overflow-y-scroll',
            filteredStates?.length === 0 && 'h-0'
          )}
        >
          {stateOptions}
        </Combobox.Options>
      </div>
    </Combobox>
  )
}
