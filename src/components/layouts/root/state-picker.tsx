import { useCallback, useMemo, useRef, useState } from 'react'

import Image from 'next/image'

import { getFlagUrl } from '@geobuff/flags'
import { Combobox, Transition } from '@headlessui/react'
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
    shippingState || states?.[0] || ({ abbreviation: 'TX', name: 'TX', provinceID: 48 } as State)
  )
  const ref = useRef<HTMLInputElement | null>(null)

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
            flex cursor-pointer gap-2 py-2 px-3 text-sm capitalize ui-active:bg-brand
            ui-active:text-white ui-not-active:bg-white ui-not-active:text-gray-800
          `}
          value={state}
        >
          <div className="relative h-4 w-4">
            <Image
              fill
              alt={`${selectedState.name} state flag`}
              className="object-contain"
              src={getFlagUrl(`us-${state.abbreviation}`)}
            />
          </div>
          {state.name}
        </Combobox.Option>
      )),
    [filteredStates, selectedState.name]
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
      <div className="group flex items-center rounded border border-neutral-300 px-1 text-sm">
        <button
          className="group-hover:cusor-pointer relative h-6 w-6"
          onClick={() => ref.current?.select()}
        >
          <Image
            fill
            alt={`${selectedState.name} state flag`}
            className="object-contain"
            src={getFlagUrl(`us-${selectedState.abbreviation}`)}
          />
        </button>
        <Combobox.Input
          ref={ref}
          className="h-8 w-10 bg-neutral-50 p-0.5 text-center font-bold group-hover:cursor-pointer"
          displayValue={(state: State | undefined) => state?.abbreviation || ''}
          onChange={event => setSearchQuery(event.target.value)}
          onClick={() => ref.current?.select()}
        />
        <Transition />
      </div>
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
