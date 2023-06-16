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

interface StructureFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const StructureFilter = ({ slug, values }: StructureFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const structures = useMemo(() => {
    let filterValues =
      products?.flatMap(product => product.attributes?.Structure?.split('|')).filter(Boolean) || []
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
      .map(varietal => ({ name: varietal, type: 'structure' }))
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
    () => (structures.length > 5 ? structures.slice(0, 5) : undefined),
    [structures]
  )
  const otherFilters = useMemo(
    () => (structures.length > 5 && popular !== undefined ? structures.slice(5) : structures),
    [popular, structures]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2 pt-2">
            {popular.map(structure => (
              <FilterCheckbox key={structure.name} filter={structure} />
            ))}
            <Divider />
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 pt-4">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(structure => (
              <FilterCheckbox key={structure.name} filter={structure} />
            ))}
        {structures.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
