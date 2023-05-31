import { useMemo } from 'react'

import { Transition } from '@mantine/core'
import { Content, FilledContentRelationshipField } from '@prismicio/client'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

import { Filter } from './filter'

export type Filter = 'brand' | 'price' | 'varietal' | 'flavor' | 'structure' | 'region'
export type EnabledFilters = Filter[]

export interface FiltersProps {
  enabledFilters?: FilledContentRelationshipField<'filter', string, Content.FilterDocument>[]
  show: boolean
}

export const Filters = ({ enabledFilters, show }: FiltersProps) => {
  const enabledFiltersElements = useMemo(
    () =>
      enabledFilters !== undefined && enabledFilters.length > 0
        ? enabledFilters.map(filter => <Filter key={filter.id} data={filter} />)
        : undefined,
    [enabledFilters]
  )

  const filterMenu = useMemo(
    () => (
      <div
        className={clsx(
          'sticky top-8 left-0 -translate-x-96 z-10 transition-transform border border-neutral-light rounded shadow h-max',
          show && 'translate-x-0'
        )}
      >
        <Transition
          mounted={show && enabledFilters !== undefined && enabledFilters.length > 0}
          transition="slide-right"
        >
          {styles => (
            <div
              key="filters-transition"
              className="min-w-[15rem] rounded p-4 bg-[#f5f3f2]"
              style={styles}
            >
              <Typography as="h2" displayAs="h6">
                Filters
              </Typography>
              {enabledFiltersElements}
            </div>
          )}
        </Transition>
      </div>
    ),
    [enabledFilters, enabledFiltersElements, show]
  )

  return filterMenu
}
