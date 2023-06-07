import { useMemo } from 'react'

import { useDisclosure } from '@mantine/hooks'

import { BlurImage } from '@/components/blur-image'
import { Accordion } from '@/core/components/accordion'
import { Button } from '@/core/components/button'
import { Typography } from '@/core/components/typogrpahy'
import { useProductsQuery } from '@/lib/queries/products'
import { Filter } from '@/lib/stores/filters'

import { FilterCheckbox } from './checkbox'

interface PairingNoteFilterProps {
  slug: string
}

export const PairingNoteFilter = ({ slug }: PairingNoteFilterProps) => {
  const [showAll, { toggle: toggleShowAll }] = useDisclosure(false)
  const { data: products } = useProductsQuery()

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
      .map(note => ({ imageUrl: note.imageUrl, name: note.name, type: 'pairing-note' }))
  }, [products]) satisfies Filter[]

  const data = useMemo(
    () => (showAll ? pairingNotes : pairingNotes.slice(0, 5)),
    [showAll, pairingNotes]
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
        {data.map(pairingNote => (
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
