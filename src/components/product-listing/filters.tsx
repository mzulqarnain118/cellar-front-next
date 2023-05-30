import { useMemo } from 'react'

import { Transition } from '@mantine/core'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'

export type Filter = 'brand' | 'price' | 'varietal' | 'flavor' | 'structure' | 'region'
export type EnabledFilters = Filter[]

export interface FiltersProps {
  enabledFilters: EnabledFilters
  show: boolean
}

export const Filters = ({ show }: FiltersProps) => {
  const filterMenu = useMemo(
    () => (
      <div className={clsx('lg:absolute left-0 top-[20.4375rem]')}>
        <Transition mounted={show} transition="slide-right">
          {styles => (
            <div
              className="max-w-[15.75rem] min-w-[15.75rem] rounded p-4 bg-[#f5f3f2]"
              style={styles}
            >
              <Typography as="h2" displayAs="h6">
                Filters
              </Typography>
            </div>
          )}
        </Transition>
      </div>
    ),
    [show]
  )

  return filterMenu
}
