import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import { FilterCheckbox } from './checkbox'

interface VarietalFilterProps {
  slug: string
}

export const VarietalFilter = ({ slug }: VarietalFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const varietals = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Varietal).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)

    return filterValues
      .reduce<string[]>((array, currentFilter) => {
        const index = array.findIndex(
          element => element.toLowerCase() === currentFilter.toLowerCase()
        )
        if (index === -1) {
          array.push(currentFilter)
        }

        return array
      }, [])
      .map(varietal => ({ name: varietal, type: 'varietal' }))
  }, [products]) satisfies Filter[]

  const data = useMemo(() => (showAll ? varietals : varietals.slice(0, 5)), [varietals, showAll])

  const showAllButton = useMemo(
    () => (
      <Button link onClick={toggleShowAll}>
        {showAll ? 'Show less...' : 'Show all...'}
      </Button>
    ),
    [showAll, toggleShowAll]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      <div className="space-y-2 pt-4">
        {data.map(varietal => (
          <FilterCheckbox key={varietal.name} filter={varietal} />
        ))}
        {varietals.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
