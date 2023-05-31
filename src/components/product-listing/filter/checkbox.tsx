import { ReactNode, useCallback, useMemo } from 'react'

import { Checkbox } from '@/core/components/checkbox'
import { useFiltersStore } from '@/lib/stores/filters'

const checkboxClassNames = {
  body: 'items-center',
}

interface FilterCheckboxProps {
  label?: ReactNode
  name: string
}

export const FilterCheckbox = ({ label, name }: FilterCheckboxProps) => {
  const { activeFilters, toggleActiveFilter } = useFiltersStore()

  const value = useMemo(() => activeFilters.includes(name), [activeFilters, name])
  const handleFilterToggle = useCallback(() => {
    toggleActiveFilter(name)
  }, [name, toggleActiveFilter])

  return (
    <Checkbox
      checked={value}
      className="capitalize"
      classNames={checkboxClassNames}
      color="dark"
      label={label || name}
      onChange={handleFilterToggle}
    />
  )
}
