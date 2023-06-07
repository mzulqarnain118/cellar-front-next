import { useCallback } from 'react'

import { useWindowScroll } from '@mantine/hooks'

import { Chip } from '@/core/components/chip'
import { Filter, useFiltersStore } from '@/lib/stores/filters'

interface FilterChipProps {
  filter: Filter
}

export const FilterChip = ({ filter }: FilterChipProps) => {
  const { removeFilter } = useFiltersStore()
  const [_, scrollTo] = useWindowScroll()

  const onChipClick = useCallback(() => {
    scrollTo({ y: 0 })
    removeFilter(filter)
  }, [filter, removeFilter, scrollTo])

  return (
    <Chip className="animate-fade-in transition-all" name={filter.name} onClick={onChipClick} />
  )
}
