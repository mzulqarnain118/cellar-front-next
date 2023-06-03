import { useCallback, useMemo } from 'react'

import { getCookie, setCookie } from 'cookies-next'

const expires = new Date(2147483647 * 1000)

export const useAgeVerified = () => {
  const ageVerified = getCookie('age-verified')?.toString() || 'false'
  const setAgeVerified = useCallback(
    (value: 'true' | 'false') => setCookie('age-verified', value, { expires }),
    []
  )
  return useMemo(() => ({ ageVerified, setAgeVerified }), [ageVerified, setAgeVerified])
}
