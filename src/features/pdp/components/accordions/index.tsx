'use client'

import { ReactNode, useMemo } from 'react'

import { Accordion, AccordionProps } from '@mantine/core'
import { Content } from '@prismicio/client'
import { asText } from '@prismicio/helpers'
import { PrismicRichText } from '@prismicio/react'
import { SliceZone } from '@prismicio/types'

import { BlurImage } from '@/components/blur-image'
import { Typography } from '@/core/components/typogrpahy'
import { ProductsSchema } from '@/lib/types/schemas/product'

interface AccordionsProps {
  attributes: ProductsSchema['attributes']
  data: SliceZone<Content.PdpDocumentDataBodyAccordionSlice> | undefined
}

interface CustomAccordion {
  children: ReactNode | ReactNode[]
  id: 'tasting-notes' | 'pairing-notes'
  title: string
}

const isCustomAccordion = (data: unknown): data is CustomAccordion =>
  !!data &&
  typeof data === 'object' &&
  'id' in data &&
  (data.id === 'tasting-notes' || data.id === 'pairing-notes')

export const Accordions = ({ attributes, data }: AccordionsProps) => {
  const tastingNotes = useMemo(
    () =>
      attributes?.['Tasting Notes']?.map(note => (
        <div key={note.name} className="flex items-center gap-2 capitalize">
          <BlurImage alt={note.name} height={40} src={note.imageUrl} width={40} />
          <Typography>{note.name}</Typography>
        </div>
      )),
    [attributes]
  )
  const tastingNotesData: CustomAccordion[] = useMemo(
    () =>
      tastingNotes !== undefined && tastingNotes.length > 0
        ? [
            {
              children: tastingNotes,
              id: 'tasting-notes',
              title: 'Tasting Notes',
            },
          ]
        : [],
    [tastingNotes]
  )
  const pairingNotes = useMemo(
    () =>
      attributes?.['Pairing Notes']?.map(note => (
        <div key={note.name} className="flex items-center gap-2 capitalize">
          <BlurImage alt={note.name} height={40} src={note.imageUrl} width={40} />
          <Typography>{note.name}</Typography>
        </div>
      )),
    [attributes]
  )
  const pairingNotesData: CustomAccordion[] = useMemo(
    () =>
      pairingNotes !== undefined && pairingNotes.length > 0
        ? [
            {
              children: pairingNotes,
              id: 'pairing-notes' as const,
              title: 'Pairing Notes',
            },
          ]
        : [],
    [pairingNotes]
  )
  const accordionsData: (Content.PdpDocumentDataBodyAccordionSlice | CustomAccordion)[] = useMemo(
    () =>
      data !== undefined && data.length > 0
        ? [
            ...data.slice(0, 1),
            ...tastingNotesData,
            ...pairingNotesData,
            ...data.slice(1, data.length),
          ]
        : [...tastingNotesData, ...pairingNotesData],
    [pairingNotesData, data, tastingNotesData]
  )

  const titles = useMemo(
    () =>
      accordionsData.map(accordion =>
        isCustomAccordion(accordion) ? accordion.title : asText(accordion.primary.title)
      ),
    [accordionsData]
  )

  const accordions = useMemo(
    () =>
      accordionsData.map(accordion => {
        const title = isCustomAccordion(accordion)
          ? accordion.title
          : asText(accordion.primary.title)

        let children
        if (isCustomAccordion(accordion) && accordion.id === 'pairing-notes') {
          children = (
            <div className="flex flex-wrap items-center [&>*]:basis-1/2 [&>*]:lg:basis-1/4">
              {pairingNotes}
            </div>
          )
        } else if (isCustomAccordion(accordion) && accordion.id === 'tasting-notes') {
          children = (
            <div className="flex flex-wrap items-center [&>*]:basis-1/2 [&>*]:lg:basis-1/4">
              {tastingNotes}
            </div>
          )
        } else if ('primary' in accordion) {
          children = <PrismicRichText field={accordion.primary.content} />
        }

        return (
          <Accordion.Item key={accordion.id} value={title}>
            <Accordion.Control>
              <Typography as="h2" displayAs="h6">
                {title}
              </Typography>
            </Accordion.Control>
            <Accordion.Panel>
              {children}
              {isCustomAccordion(accordion) || accordion.primary.video.html === null ? undefined : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: accordion.primary.video.html,
                  }}
                  className="mt-4 [&>iframe]:h-[21.75rem] [&>iframe]:w-full"
                />
              )}
            </Accordion.Panel>
          </Accordion.Item>
        )
      }),
    [accordionsData, pairingNotes, tastingNotes]
  )

  const styles: AccordionProps['styles'] = useMemo(
    () => ({
      item: {
        '&[data-active]': {
          backgroundColor: '#f7ede3',
        },

        backgroundColor: '#f7ede3',
      },
      panel: {
        backgroundColor: '#f7f3f4',
      },
    }),
    []
  )

  return (
    <Accordion multiple defaultValue={titles} styles={styles} variant="separated">
      {accordions}
    </Accordion>
  )
}
