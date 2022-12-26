import { NOT_ALLOWED_STATES } from '../constants'
import { State } from '../types'
import { camelizePascalKeys } from '../utils'

export const STATES_QUERY_KEY = ['states']
export const fetchFlightStates = async () => {
  const response = await (
    await fetch(`${process.env.NEXT_PUBLIC_TOWER_API_URL}shop/provincesCountryAbbr`)
  ).json()

  return camelizePascalKeys<State[]>(response).filter(
    state => !NOT_ALLOWED_STATES.includes(state.name?.toUpperCase()) && state.enabled
  )
}
