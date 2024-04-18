import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'
import type { Content, GroupField } from '@prismicio/client'

import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import type { Simplify } from 'prismicio-types'

import { FilterCheckbox } from './checkbox'

interface BrandFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const BrandFilter = ({ slug, values }: BrandFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const brands = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Brand).filter(Boolean) || []
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
      .map(brand => ({ name: brand, type: 'brand' }))
  }, [products, values]) satisfies Filter[]

  const showAllButton = useMemo(
    () => (
      <Button link onClick={toggleShowAll}>
        {showAll ? 'Show less...' : 'Show all...'}
      </Button>
    ),
    [showAll, toggleShowAll]
  )

  const popular = useMemo(() => (brands.length > 5 ? brands.slice(0, 5) : undefined), [brands])
  const otherFilters = useMemo(
    () => (brands.length > 5 && popular !== undefined ? brands.slice(5) : brands),
    [popular, brands]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2 pt-2">
            {popular.map(brand => (
              <FilterCheckbox key={brand.name} filter={brand} />
            ))}
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 mt-2">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(brand => <FilterCheckbox key={brand.name} filter={brand} />)}
        {brands.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
