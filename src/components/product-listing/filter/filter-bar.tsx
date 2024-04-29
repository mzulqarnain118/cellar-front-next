import { useCallback } from 'react';


import { useRouter } from 'next/router';

import { useWindowScroll } from '@mantine/hooks';
import { clsx } from 'clsx';

import { Chip } from '@/core/components/chip';
import { useFiltersStore } from '@/lib/stores/filters';

import { FilterChip } from './filter-chip';

export const FilterBar = () => {
  const { activeFilters, clearAll } = useFiltersStore()
  const [_, scrollTo] = useWindowScroll()
  const { searchValue, clearSearchValue, } = useFiltersStore()

  const router = useRouter()

  const handleClearAll = useCallback(() => {
    scrollTo({ y: 0 })
    clearAll()
  }, [clearAll, scrollTo])
  const handleClearSearch = useCallback(() => {
    router.push(localStorage.getItem('searchedPage'))
    clearSearchValue()
  }, [])

  return (
    <div
      className={clsx(
        'flex max-h-0 flex-wrap gap-2 transition-all items-end col-span-1',
        (activeFilters.length > 0 || searchValue) && '!max-h-max'
      )}
    >
      {activeFilters.map(filter => (
        <FilterChip key={filter.name} filter={filter} />
      ))}
      {searchValue && (<Chip className="animate-fade-in transition-all" name='Clear Search' onClick={handleClearSearch} />
      )}
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
