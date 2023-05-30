import { useCallback, useMemo } from 'react'

import { getCookie, setCookie } from 'cookies-next'

export const useAgeVerified = () => {
  const ageVerified = getCookie('age-verified')?.toString() || 'false'
  const setAgeVerified = useCallback(
    (value: 'true' | 'false') => setCookie('age-verified', value, { maxAge: 60 * 6 * 24 }),
    []
  )
  return useMemo(() => ({ ageVerified, setAgeVerified }), [ageVerified, setAgeVerified])
}
