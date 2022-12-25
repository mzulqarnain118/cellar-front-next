import { NOT_ALLOWED_STATES } from '../constants'
import { State } from '../types'
import { camelizeKeys } from '../utils'

export const STATES_QUERY_KEY = ['states']
export const fetchFlightStates = async () => {
  const response = await (
    await fetch(`${process.env.NEXT_PUBLIC_TOWER_API_URL}shop/provincesCountryAbbr`)
  ).json()

  return camelizeKeys<State[]>(response).filter(
    state => !NOT_ALLOWED_STATES.includes(state.name.toUpperCase()) && state.enabled
  )
}
