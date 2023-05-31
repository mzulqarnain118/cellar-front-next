import { useCallback } from 'react'

import { useWindowScroll } from '@mantine/hooks'
import { clsx } from 'clsx'

import { useFiltersStore } from '@/lib/stores/filters'
import { Chip } from '@/ui/chip'

export const FilterBar = () => {
  const { activeFilters, clearAll, removeFilter } = useFiltersStore()
  const [_, scrollTo] = useWindowScroll()

  const onChipClick = useCallback(
    (name: string) => {
      scrollTo({ y: 0 })
      removeFilter(name)
    },
    [removeFilter, scrollTo]
  )

  const handleClearAll = useCallback(() => {
    scrollTo({ y: 0 })
    clearAll()
  }, [clearAll, scrollTo])

  return (
    <div
      className={clsx(
        'flex max-h-0 flex-wrap gap-2 transition-all items-end col-span-2 lg:col-span-1',
        activeFilters.length > 0 && '!max-h-max'
      )}
    >
      {activeFilters.map(filter => (
        <Chip
          key={filter}
          className="animate-fade-in transition-all"
          name={filter}
          onClick={onChipClick}
        />
      ))}
      {activeFilters.length > 0 && (
        <button
          className="text-brand mb-1 hover:text-brand-600 active:text-brand-700 ml-2 transition-colors hover:underline"
          type="button"
          onClick={handleClearAll}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
