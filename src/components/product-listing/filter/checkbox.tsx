import { ReactNode, useCallback, useMemo } from 'react'

import { Checkbox } from '@/core/components/checkbox'
import { Filter, useFiltersStore } from '@/lib/stores/filters'

const checkboxClassNames = {
  body: 'items-center',
}

interface FilterCheckboxProps {
  filter: Filter
  label?: ReactNode
}

export const FilterCheckbox = ({ filter, label }: FilterCheckboxProps) => {
  const { activeFilters, toggleActiveFilter } = useFiltersStore()

  const value = useMemo(
    () => !!activeFilters.find(element => element.name === filter.name),
    [activeFilters, filter]
  )
  const handleFilterToggle = useCallback(() => {
    toggleActiveFilter(filter)
  }, [filter, toggleActiveFilter])

  return (
    <Checkbox
      checked={value}
      className="capitalize"
      classNames={checkboxClassNames}
      color="dark"
      label={label || filter.name}
      onChange={handleFilterToggle}
    />
  )
}
