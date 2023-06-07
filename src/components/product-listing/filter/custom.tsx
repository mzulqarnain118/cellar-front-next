import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'
import { Content } from '@prismicio/client'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Filter } from '@/lib/stores/filters'

import { FilterCheckbox } from './checkbox'

interface CustomFilterProps {
  filter: Content.FilterDocumentData
}

export const CustomFilter = ({ filter }: CustomFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)

  const options = useMemo(
    () =>
      filter.values
        .map(value =>
          value.display_category_id
            ? {
                displayCategoryIds: [value.display_category_id as number],
                name: value.display_name as string,
                type: 'custom' as const,
              }
            : undefined
        )
        .filter(Boolean) || [],
    [filter.values]
  ) satisfies Filter[]

  const data = useMemo(() => (showAll ? options : options.slice(0, 5)), [options, showAll])

  const showAllButton = useMemo(
    () => (
      <Button link onClick={toggleShowAll}>
        {showAll ? 'Show less...' : 'Show all...'}
      </Button>
    ),
    [showAll, toggleShowAll]
  )

  return (
    <Accordion openByDefault header={filter.name as string}>
      <div className="space-y-2 pt-4">
        {data.map(customFilter => (
          <FilterCheckbox key={customFilter.name} filter={customFilter} />
        ))}
        {data.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
