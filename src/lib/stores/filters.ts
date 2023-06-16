import { create } from 'zustand'

export type FilterType =
  | 'brand'
  | 'custom'
  | 'pairing-note'
  | 'price'
  | 'country'
  | 'tasting-note'
  | 'varietal'
  | 'structure'

export interface Filter {
  displayCategoryIds?: number[]
  imageUrl?: string
  name: string
  type: FilterType
  value?: [number, number]
}

interface FiltersStore {
  activeFilters: Filter[]
  clearAll: () => void
  removeFilter: (filter: Filter) => void
  toggleActiveFilter: (activeFilter: Filter) => void
}

export const useFiltersStore = create<FiltersStore>(set => ({
  activeFilters: [],
  clearAll: () => set(() => ({ activeFilters: [] })),
  removeFilter: (filter: Filter) => {
    set(({ activeFilters }) => ({
      activeFilters: activeFilters.filter(activeFilter => activeFilter.name !== filter.name),
    }))
  },
  toggleActiveFilter: (activeFilter: Filter) =>
    set(({ activeFilters }) => {
      if (activeFilters.some(filter => filter.name === activeFilter.name)) {
        return { activeFilters: activeFilters.filter(filter => filter.name !== activeFilter.name) }
      }

      return { activeFilters: [...activeFilters, activeFilter] }
    }),
}))
