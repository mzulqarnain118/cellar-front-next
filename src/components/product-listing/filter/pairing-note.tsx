import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'
import type { Content, GroupField } from '@prismicio/client'

import { BlurImage } from '@/components/blur-image'
import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import type { Simplify } from 'prismicio-types'

import { FilterCheckbox } from './checkbox'

interface PairingNoteFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const PairingNoteFilter = ({ slug, values }: PairingNoteFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const pairingNotes = useMemo(() => {
    let filterValues =
      products?.map(product => product.attributes?.['Pairing Notes']).filter(Boolean) || []
    filterValues = filterValues?.filter((value, index) => filterValues.indexOf(value) === index)

    const manualValues =
      values
        ?.map(value => value.display_name)
        .filter(Boolean)
        .map(value =>
          filterValues.find(filter =>
            filter.find(filterValue => filterValue.name.toLowerCase() === value.toLowerCase())
          )
        )
        .filter(Boolean) || []

    return [...manualValues, ...filterValues]
      .reduce((array, note) => {
        if (!array.find(item => item?.name.toLowerCase() === note[0].name.toLowerCase())) {
          array.push(note[0])
        }
        return array
      }, [])
      .filter(Boolean)
      .map(note => ({ imageUrl: note.imageUrl, name: note.name, type: 'pairing-note' }))
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
    () => (pairingNotes.length > 5 ? pairingNotes.slice(0, 5) : undefined),
    [pairingNotes]
  )
  const otherFilters = useMemo(
    () => (pairingNotes.length > 5 && popular !== undefined ? pairingNotes.slice(5) : pairingNotes),
    [popular, pairingNotes]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2 pt-2">
            {popular.map(pairingNote => (
              <FilterCheckbox
                key={pairingNote.name}
                filter={pairingNote}
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={pairingNote.name.replaceAll('-', ' ')}
                          sizes="(max-width: 992px) 50vw, (max-width: 1400px) 100vw"
                          src={pairingNote.imageUrl}
                        />
                      </div>
                      <Typography>{pairingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))}
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 mt-2">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(pairingNote => (
              <FilterCheckbox
                key={pairingNote.name}
                filter={pairingNote}
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={pairingNote.name.replaceAll('-', ' ')}
                          sizes="(max-width: 992px) 50vw, (max-width: 1400px) 100vw"
                          src={pairingNote.imageUrl}
                        />
                      </div>
                      <Typography>{pairingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))}
        {pairingNotes.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
