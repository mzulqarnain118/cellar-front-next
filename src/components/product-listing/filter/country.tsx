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

interface RegionFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const CountryFilter = ({ slug, values }: RegionFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const countries = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Origin).filter(Boolean) || []
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
      .map(region => ({ name: region, type: 'country' }))
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
    () => (countries.length > 5 ? countries.slice(0, 5) : undefined),
    [countries]
  )
  const otherFilters = useMemo(
    () => (countries.length > 5 && popular !== undefined ? countries.slice(5) : countries),
    [popular, countries]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2 pt-2">
            {popular.map(country => (
              <FilterCheckbox key={country.name} filter={country} />
            ))}
            <Divider />
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 pt-4">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(country => <FilterCheckbox key={country.name} filter={country} />)}
        {countries.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
