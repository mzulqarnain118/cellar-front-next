import { useQuery } from '@tanstack/react-query'

import { camelizePascalKeys } from '@/core/utils'

import { api } from '../api'
import { NOT_ALLOWED_STATES } from '../constants'
import { State } from '../types'

export const STATES_QUERY_KEY = ['states']
export const fetchFlightStates = async () => {
  const response = await api('shop/provincesCountryAbbr').json<State[]>()

  return camelizePascalKeys<State[]>(response).filter(
    state => !NOT_ALLOWED_STATES.includes(state.name?.toUpperCase()) && state.enabled
  )
}

export const useStatesQuery = () =>
  useQuery(STATES_QUERY_KEY, fetchFlightStates, {
    // * NOTE: This data changes VERY RARELY.
    // cacheTime: Infinity,
    meta: {
      persist: true,
    },
    // staleTime: Infinity,
  })
