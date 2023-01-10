import { clsx } from 'clsx'

import { useFiltersStore } from '@/lib/stores/filters'
import { Chip } from '@/ui/chip'

export const FilterBar = () => {
  const { activeFilters, clearAll, removeFilter } = useFiltersStore()

  return (
    <div
      className={clsx(
        'flex max-h-0 flex-wrap gap-2 transition-all',
        activeFilters.length > 0 && 'mb-4 !max-h-max'
      )}
    >
      {activeFilters.map(filter => (
        <Chip
          key={filter}
          className="animate-fade-in transition-all"
          name={filter}
          onClick={name => removeFilter(name)}
        />
      ))}
      {activeFilters.length > 0 && (
        <button
          className="ml-2 text-primary-400 hover:underline"
          type="button"
          onClick={() => clearAll()}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
