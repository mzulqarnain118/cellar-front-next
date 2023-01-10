import create from 'zustand'

interface FiltersStore {
  activeFilters: string[]
  clearAll: () => void
  removeFilter: (filter: string) => void
  toggleActiveFilter: (activeFilter: string) => void
}

export const useFiltersStore = create<FiltersStore>(set => ({
  activeFilters: [],
  clearAll: () => set(() => ({ activeFilters: [] })),
  removeFilter: (filter: string) => {
    set(({ activeFilters }) => ({
      activeFilters: activeFilters.filter(activeFilter => activeFilter !== filter),
    }))
  },
  toggleActiveFilter: (activeFilter: string) =>
    set(({ activeFilters }) => {
      if (activeFilters.includes(activeFilter)) {
        return { activeFilters: activeFilters.filter(filter => filter !== activeFilter) }
      }

      return { activeFilters: [...activeFilters, activeFilter] }
    }),
}))
