import { QueryFunction } from '@tanstack/react-query'

import { DEFAULT_CONSULTANT_STATE } from '../stores/consultant'
import { Consultant } from '../types'

export const CONSULTANT_QUERY_KEY = ['consultant']
export const getConsultantData: QueryFunction<Consultant> = async ({ queryKey }) => {
  const [_, repUrl] = queryKey
  if (!repUrl) {
    return DEFAULT_CONSULTANT_STATE
  }

  const response = await (
    await fetch(`${process.env.NEXT_PUBLIC_TOWER_API_URL}info/rep/${repUrl}`)
  ).json()

  if (!response.DisplayID) {
    return DEFAULT_CONSULTANT_STATE
  }

  const consultant: Consultant = {
    displayId: response.DisplayID,
    displayName: response.DisplayName,
    url: response.Url,
  }

  return consultant
}
