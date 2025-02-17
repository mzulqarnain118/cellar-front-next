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
  searchValue: string // Added searchValue property

  previousPriceValue: [number, number] | null
  clearAll: () => void
  removeFilter: (filter: Filter) => void
  toggleActiveFilter: (activeFilter: Filter) => void
  setPreviousPriceValue: (value: [number, number]) => void
  setSearchValue: (value: string) => void // Added setSearchValue function
  clearSearchValue: () => void // Added clearSearchValue function
}

export const useFiltersStore = create<FiltersStore>(set => ({
  activeFilters: [],
  previousPriceValue: null,
  searchValue: '',

  clearAll: () => set({ activeFilters: [], previousPriceValue: null }),
  removeFilter: filter =>
    set(state => ({
      activeFilters: state.activeFilters.filter(activeFilter => activeFilter.name !== filter.name),
      previousPriceValue: filter.type === 'price' ? state.previousPriceValue : null,
    })),
  toggleActiveFilter: activeFilter =>
    set(state => {
      if (activeFilter.type === 'price') {
        return {
          activeFilters: [
            ...state.activeFilters.filter(filter => filter.name !== activeFilter.name),
            activeFilter,
          ],
          previousPriceValue:
            state.activeFilters.find(filter => filter.name === 'price')?.value ||
            state.previousPriceValue,
        }
      }

      if (state.activeFilters.some(filter => filter.name === activeFilter.name)) {
        return {
          activeFilters: state.activeFilters.filter(filter => filter.name !== activeFilter.name),
        }
      }

      return {
        activeFilters: [...state.activeFilters, activeFilter],
      }
    }),
  setPreviousPriceValue: value => set({ previousPriceValue: value }),
  setSearchValue: value => set({ searchValue: value }), // Added setSearchValue function
  clearSearchValue: () => set({ searchValue: '' }), // Added clearSearchValue function
}))
