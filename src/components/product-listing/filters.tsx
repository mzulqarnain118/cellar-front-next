import { useMemo } from 'react'

import { Drawer, Transition } from '@mantine/core'
import { Content, FilledContentRelationshipField } from '@prismicio/client'
import { clsx } from 'clsx'

import { Typography } from '@/core/components/typogrpahy'
import { useIsDesktop } from '@/core/hooks/use-is-desktop'
import { ProductsSchema } from '@/lib/types/schemas/product'

import { Filter } from './filter'

export type Filter = 'brand' | 'price' | 'varietal' | 'flavor' | 'structure' | 'region'
export type EnabledFilters = Filter[]

const filterMenuClassNames = {
  body: 'p-0',
  header: 'bg-[#f5f3f2]',
}

export interface FiltersProps {
  enabledFilters?: FilledContentRelationshipField<'filter', string, Content.FilterDocumentData>[]
  onClose: () => void
  show: boolean
  products: ProductsSchema[]
}

export const Filters = ({ enabledFilters, onClose, show, products }: FiltersProps) => {
  const isDesktop = useIsDesktop()

  const enabledFiltersElements = useMemo(
    () =>
      enabledFilters !== undefined && enabledFilters?.length > 0
        ? enabledFilters.map(filter => <Filter key={filter.id} data={filter} products={products} />)
        : undefined,
    [enabledFilters, products]
  )

  const Wrapper = useMemo(() => (isDesktop ? 'div' : Drawer), [isDesktop])
  const wrapperProps = useMemo(
    () =>
      isDesktop
        ? // eslint-disable-next-line @typescript-eslint/no-empty-function
          { onClose: () => {}, opened: 'false' }
        : { classNames: filterMenuClassNames, onClose, opened: show },
    [isDesktop, onClose, show]
  )

  const filterMenu = useMemo(
    () => (
      // @ts-ignore
      <Wrapper {...wrapperProps}>
        <div
          className={clsx(
            `lg:sticky lg:top-8 lg:left-0 lg:-translate-x-96 lg:z-10 lg:transition-transform
            lg:border lg:border-neutral-light lg:rounded lg:shadow-lg lg:h-max`,
            show && 'lg:translate-x-0'
          )}
        >
          <Transition
            mounted={show && enabledFilters !== undefined && enabledFilters?.length > 0}
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
      </Wrapper>
    ),
    [Wrapper, enabledFilters, enabledFiltersElements, show, wrapperProps]
  )

  return filterMenu
}
