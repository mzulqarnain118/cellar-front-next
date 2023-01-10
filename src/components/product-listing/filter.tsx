import { useState } from 'react'

import { useProductFilter } from '@/lib/queries/products'
import { useFiltersStore } from '@/lib/stores/filters'
import { Accordion } from '@/ui/accordion'
import { Checkbox } from '@/ui/checkbox'

interface FilterProps {
  name: string
}

export const Filter = ({ name }: FilterProps) => {
  const { data: filters, isFetching, isLoading } = useProductFilter(name)
  const { activeFilters, toggleActiveFilter } = useFiltersStore()
  const [seeAll, setSeeAll] = useState(false)
  const data = filters ? filters.slice(0, seeAll ? filters.length - 1 : 5) || [] : []

  const handleSeeAllToggle = () => setSeeAll(prev => !prev)

  if (isFetching || isLoading) {
    return (
      <div className="flex animate-pulse flex-col space-y-2">
        <div className="flex w-full items-center gap-2">
          <div className="h-8 w-full rounded bg-primary-300" />
          <div className="h-4 w-4 bg-primary-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary-300" />
          <div className="h-4 w-48 rounded bg-primary-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary-300" />
          <div className="h-4 w-48 rounded bg-primary-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary-300" />
          <div className="h-4 w-48 rounded bg-primary-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary-300" />
          <div className="h-4 w-48 rounded bg-primary-300" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary-300" />
          <div className="h-4 w-48 rounded bg-primary-300" />
        </div>
      </div>
    )
  }

  return (
    <Accordion openByDefault header={name}>
      <div className="space-y-1">
        {data.map(filter => (
          <Checkbox
            key={filter}
            checked={activeFilters.includes(filter)}
            containerClassName="animate-fade-in"
            label={filter}
            onChange={e => toggleActiveFilter(e.target.value)}
          />
        ))}
      </div>
      <button
        className="mt-3 font-medium text-primary-500 hover:text-primary-400 hover:underline"
        type="button"
        onClick={handleSeeAllToggle}
      >
        {seeAll ? 'Show less...' : 'See all...'}
      </button>
    </Accordion>
  )
}
