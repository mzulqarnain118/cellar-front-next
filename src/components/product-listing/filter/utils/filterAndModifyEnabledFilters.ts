import { Content, FilledContentRelationshipField } from '@prismicio/client'

import { ProductsSchema } from '@/lib/types/schemas/product'

interface FilterValue {
  display_name: string
  display_category_id: number | null
}

interface FilterData {
  name: string
  values: FilterValue[]
}

export interface EnabledFilter {
  id: string
  type: string
  tags: any[]
  lang: string
  slug: string
  first_publication_date: string
  last_publication_date: string
  data: FilterData
  link_type: string
  isBroken: boolean
}

function filterAndModifyEnabledFilters(
  products: ProductsSchema[],
  enabledFiltersArray?: FilledContentRelationshipField<
    'filter',
    string,
    Content.FilterDocumentData
  >[]
): EnabledFilter[] {
  // Function to extract common display categories
  const extractCommonDisplayCategories = (products: ProductsSchema[]): number[] => {
    // Set to store the common display categories
    const commonCategories = new Set<number>()

    // Iterate over each object in the array
    products?.forEach(obj => {
      // Get the display categories of the current object
      const displayCategories: number[] = obj.displayCategories

      // If it's the first object, initialize commonCategories with its display categories
      if (commonCategories.size === 0) {
        displayCategories.forEach(category => commonCategories.add(category))
      } else {
        // If it's not the first object, add any new categories found
        displayCategories.forEach(category => {
          if (!commonCategories.has(category)) {
            commonCategories.add(category)
          }
        })
      }
    })

    return Array.from(commonCategories)
  }

  // Function to filter enabledFilters based on common display categories
  const filterEnabledFilters = (
    enabledFilters: EnabledFilter[],
    commonDisplayCategories: number[]
  ): EnabledFilter[] => {
    const changedEnabledFilter = structuredClone(enabledFilters)

    // Find the object with data.name equal to "Collection"
    const collectionFilter = changedEnabledFilter.find(filter => {
      // Ensure that filter and filter.data are not undefined
      if (filter && filter.data) {
        return filter.data.name === 'Collection'
      }
      return false
    })

    // If collectionFilter is found, filter its data.values array
    if (collectionFilter) {
      collectionFilter.data.values = collectionFilter.data.values.filter(
        value =>
          value.display_category_id !== null &&
          commonDisplayCategories.includes(value.display_category_id)
      )
    }

    return changedEnabledFilter
  }

  // Extract common display categories
  const commonDisplayCategories = extractCommonDisplayCategories(products)

  // Filter enabledFilters based on common display categories
  const changedEnabledFilters = filterEnabledFilters(enabledFiltersArray, commonDisplayCategories)

  return changedEnabledFilters
}

export default filterAndModifyEnabledFilters
