import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'

import { BlurImage } from '@/components/blur-image'
import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import { FilterCheckbox } from './checkbox'

interface TastingNoteFilterProps {
  slug: string
}

export const TastingNoteFilter = ({ slug }: TastingNoteFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

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
      .map(note => ({ imageUrl: note.imageUrl, name: note.name, type: 'tasting-note' }))
  }, [products]) satisfies Filter[]

  const data = useMemo(
    () => (showAll ? tastingNotes : tastingNotes.slice(0, 5)),
    [showAll, tastingNotes]
  )

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
        {data.map(tastingNote => (
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
