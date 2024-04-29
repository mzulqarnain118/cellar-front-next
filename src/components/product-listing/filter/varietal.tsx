import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'
import type { Content, GroupField } from '@prismicio/client'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { Filter } from '@/lib/stores/filters'
import { ProductsSchema } from '@/lib/types/schemas/product'

import type { Simplify } from 'prismicio-types'

import { FilterCheckbox } from './checkbox'

interface VarietalFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
  products: ProductsSchema[]
}

export const VarietalFilter = ({ slug, values, products }: VarietalFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)

  const varietals = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Varietal).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)
    // const manualValues = values?.map(value => value.display_name).filter(Boolean) || []

    return [...filterValues]
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

  const showAllButton = useMemo(
    () => (
      <Button link onClick={toggleShowAll}>
        {showAll ? 'Show less...' : 'Show all...'}
      </Button>
    ),
    [showAll, toggleShowAll]
  )

  const popular = useMemo(
    () => (varietals.length > 5 ? varietals.slice(0, 5) : undefined),
    [varietals]
  )
  const otherFilters = useMemo(
    () => (varietals.length > 5 && popular !== undefined ? varietals.slice(5) : varietals),
    [popular, varietals]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2">
            {popular.map(varietal => (
              <FilterCheckbox key={varietal.name} filter={varietal} />
            ))}
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 mt-2">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(varietal => <FilterCheckbox key={varietal.name} filter={varietal} />)}
        {varietals.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
