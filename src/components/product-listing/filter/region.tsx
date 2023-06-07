import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import { FilterCheckbox } from './checkbox'

interface RegionFilterProps {
  slug: string
}

export const RegionFilter = ({ slug }: RegionFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const regions = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Origin).filter(Boolean) || []
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
      .map(region => ({ name: region, type: 'region' }))
  }, [products]) satisfies Filter[]

  const data = useMemo(() => (showAll ? regions : regions.slice(0, 5)), [regions, showAll])

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
        {data.map(region => (
          <FilterCheckbox key={region.name} filter={region} />
        ))}
        {regions.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
