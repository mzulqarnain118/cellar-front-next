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
          'sticky top-0 left-0 -translate-x-96 z-10 transition-transform',
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
              className="max-w-[15rem] min-w-[15rem] rounded p-4 bg-[#f5f3f2]"
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
