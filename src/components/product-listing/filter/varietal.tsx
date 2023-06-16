import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'
import type { Content, GroupField } from '@prismicio/client'
import { Divider } from 'react-daisyui'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import type { Simplify } from 'prismicio-types'

import { FilterCheckbox } from './checkbox'

interface VarietalFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const VarietalFilter = ({ slug, values }: VarietalFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const varietals = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Varietal).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)
    const manualValues = values?.map(value => value.display_name).filter(Boolean) || []

    return [...manualValues, ...filterValues]
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
  }, [products, values]) satisfies Filter[]

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
          <div className="space-y-2 pt-2">
            {popular.map(varietal => (
              <FilterCheckbox key={varietal.name} filter={varietal} />
            ))}
            <Divider />
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 pt-4">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(varietal => <FilterCheckbox key={varietal.name} filter={varietal} />)}
        {varietals.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
