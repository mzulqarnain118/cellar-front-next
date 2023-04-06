import { useMemo } from 'react'

import { useNavigationQuery } from '@/lib/queries/header'

import { NavigationItem } from './item'

export const Navigation = () => {
  const { data } = useNavigationQuery()
  const isError = false
  const isLoading = false
  const isFetching = false

  const navigationItems = useMemo(
    () => (
      <ul className="flex items-center gap-12">
        {data?.data.body?.filter(Boolean).map(item => (
          <li key={item.id}>
            <NavigationItem item={item} />
          </li>
        ))}
      </ul>
    ),
    [data?.data.body]
  )

  if (isFetching || isLoading) {
    return (
      <div
        className={`
          container mx-auto flex h-12 items-center justify-evenly border-t border-t-neutral-200
        `}
      >
        <div className="h-6 w-28 animate-pulse rounded-lg bg-neutral-200"></div>
        <div className="h-6 w-28 animate-pulse rounded-lg bg-neutral-200"></div>
        <div className="h-6 w-28 animate-pulse rounded-lg bg-neutral-200"></div>
        <div className="h-6 w-28 animate-pulse rounded-lg bg-neutral-200"></div>
      </div>
    )
  }

  if (!data || isError) {
    return <></>
  }

  return (
    <div className="bg-neutral-50 text-neutral-900">
      <nav
        className={`
          container relative mx-auto flex h-12 items-center justify-evenly border-t
          border-t-neutral-200
        `}
      >
        {navigationItems}
      </nav>
    </div>
  )
}
