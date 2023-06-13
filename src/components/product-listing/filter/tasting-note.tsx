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

interface TastingNoteFilterProps {
  slug: string
  values?: GroupField<Simplify<Content.FilterDocumentDataValuesItem>>
}

export const TastingNoteFilter = ({ slug, values }: TastingNoteFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

  const tastingNotes = useMemo(() => {
    let filterValues =
      products?.map(product => product.attributes?.['Tasting Notes']).filter(Boolean) || []
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
      .map(note => ({ imageUrl: note.imageUrl, name: note.name, type: 'tasting-note' }))
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
    () => (tastingNotes.length > 5 ? tastingNotes.slice(0, 5) : undefined),
    [tastingNotes]
  )
  const otherFilters = useMemo(
    () => (tastingNotes.length > 5 && popular !== undefined ? tastingNotes.slice(5) : tastingNotes),
    [popular, tastingNotes]
  )

  return (
    <Accordion openByDefault header={slug.replaceAll('-', ' ') || ''}>
      {popular !== undefined ? (
        <div className="pt-1">
          <Typography className="text-14">Popular</Typography>
          <div className="space-y-2 pt-2">
            {popular.map(tastingNote => (
              <FilterCheckbox
                key={tastingNote.name}
                filter={tastingNote}
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={tastingNote.name.replaceAll('-', ' ')}
                          sizes="(max-width: 992px) 50vw, (max-width: 1400px) 100vw"
                          src={tastingNote.imageUrl}
                        />
                      </div>
                      <Typography>{tastingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))}
          </div>
        </div>
      ) : undefined}
      <div className="space-y-2 pt-4">
        {popular !== undefined && !showAll
          ? undefined
          : otherFilters.map(tastingNote => (
              <FilterCheckbox
                key={tastingNote.name}
                filter={tastingNote}
                label={
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 bg-neutral-50 rounded-full border border-neutral-light">
                        <BlurImage
                          fill
                          alt={tastingNote.name.replaceAll('-', ' ')}
                          sizes="(max-width: 992px) 50vw, (max-width: 1400px) 100vw"
                          src={tastingNote.imageUrl}
                        />
                      </div>
                      <Typography>{tastingNote.name.replaceAll('-', ' ')}</Typography>
                    </div>
                  </>
                }
              />
            ))}
        {tastingNotes.length > 5 ? showAllButton : undefined}
      </div>
    </Accordion>
  )
}
