import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { useProductsQuery } from '@/lib/queries/products'

import { FilterCheckbox } from './checkbox'

interface BrandFilterProps {
  slug: string
}

export const BrandFilter = ({ slug }: BrandFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const brands = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Brand).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)

    return filterValues.reduce<string[]>((array, currentFilter) => {
      const index = array.findIndex(
        element => element.toLowerCase() === currentFilter.toLowerCase()
      )
      if (index === -1) {
        array.push(currentFilter)
      }

      return array
    }, [])
  }, [products])

  const data = useMemo(() => (showAll ? brands : brands.slice(0, 5)), [brands, showAll])

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
        {data.map(brand => (
          <FilterCheckbox key={brand} name={brand} />
        ))}
        {brands.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
