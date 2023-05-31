import { useCallback, useMemo } from 'react'

import { Slider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Content, FilledContentRelationshipField } from '@prismicio/client'

import { BlurImage } from '@/components/blur-image'
import { Button } from '@/core/components/button'
import { Checkbox } from '@/core/components/checkbox'
import { Typography } from '@/core/components/typogrpahy'
import { formatCurrency } from '@/core/utils'
import { useProductsQuery } from '@/lib/queries/products'
import { Accordion } from '@/ui/accordion'

const checkboxClassNames = {
  body: 'items-center',
}

interface FilterProps {
  data: FilledContentRelationshipField<'filter', string, Content.FilterDocument>
}

export const Filter = ({ data }: FilterProps) => {
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

  const pairingNotes = useMemo(() => {
    let filterValues =
      products?.map(product => product.attributes?.['Pairing Notes']).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)

    return filterValues
      .reduce((array, note) => {
        if (!array.find(item => item?.name.toLowerCase() === note[0].name.toLowerCase())) {
          array.push(note[0])
        }
        return array
      }, [])
      .filter(Boolean)
  }, [products])

  const tastingNotes = useMemo(() => {
    let filterValues =
      products?.map(product => product.attributes?.['Tasting Notes']).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)

    return filterValues
      .reduce((array, note) => {
        if (!array.find(item => item?.name.toLowerCase() === note[0].name.toLowerCase())) {
          array.push(note[0])
        }
        return array
      }, [])
      .filter(Boolean)
  }, [products])

  const varietals = useMemo(() => {
    let filterValues = products?.map(product => product.attributes?.Varietal).filter(Boolean) || []
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

  const showAllButton = useMemo(
    () => (
      <Button link onClick={toggleShowAll}>
        {showAll ? 'Show less...' : 'Show all...'}
      </Button>
    ),
    [showAll, toggleShowAll]
  )

  const valueLabelFormat = useCallback((value: number) => `> ${formatCurrency(value)}`, [])

  return (
    <Accordion openByDefault header={data.slug?.replaceAll('-', ' ') || ''}>
      <div className="space-y-2 pt-4">
        {data.slug === 'brand'
          ? (showAll ? brands : brands.slice(0, 5)).map(brand => (
              <Checkbox key={brand} color="dark" label={brand} />
            ))
          : undefined}
        {data.slug === 'price' ? (
          <Slider labelAlwaysOn color="dark" label={valueLabelFormat} />
        ) : undefined}
        {data.slug === 'varietal'
          ? (showAll ? varietals : varietals.slice(0, 5)).map(varietal => (
              <Checkbox key={varietal} color="dark" label={varietal} />
            ))
          : undefined}
        {data.slug === 'pairing-notes'
          ? (showAll ? pairingNotes : pairingNotes.slice(0, 5)).map(pairingNote => (
              <Checkbox
                key={pairingNote.name}
                className="capitalize"
                classNames={checkboxClassNames}
                color="dark"
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={pairingNote.name.replaceAll('-', ' ')}
                          src={pairingNote.imageUrl}
                        />
                      </div>
                      <Typography>{pairingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))
          : undefined}
        {data.slug === 'tasting-notes'
          ? (showAll ? tastingNotes : tastingNotes.slice(0, 5)).map(tastingNote => (
              <Checkbox
                key={tastingNote.name}
                className="capitalize"
                classNames={checkboxClassNames}
                color="dark"
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={tastingNote.name.replaceAll('-', ' ')}
                          src={tastingNote.imageUrl}
                        />
                      </div>
                      <Typography>{tastingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))
          : undefined}
        {data.slug !== 'price' ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
