import { useMediaQuery } from '@mantine/hooks'
import { UseMediaQueryOptions } from '@mantine/hooks/lib/use-media-query/use-media-query'

const mediaQueryOptions: UseMediaQueryOptions = { getInitialValueInEffect: false }

export const useIsDesktop = () => useMediaQuery('(min-width: 64em)', true, mediaQueryOptions)
