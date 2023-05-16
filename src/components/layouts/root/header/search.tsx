import { useCallback, useMemo, useState } from 'react'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Autocomplete, AutocompleteProps } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { clsx } from 'clsx'

const icon = <MagnifyingGlassIcon className="h-5 w-5 stroke-[3] text-black" />
export const SearchNew = () => {
  const [opened, setOpened] = useState(false)

  const close = useCallback(() => setOpened(false), [])
  const ref = useClickOutside(close)

  const classNames: AutocompleteProps['classNames'] = useMemo(
    () => ({
      input: clsx(
        'transition-all',
        opened ? 'w-full' : 'p-0 w-0 bg-[#f5f3f2] border-0 cursor-pointer'
      ),
    }),
    [opened]
  )

  const handleClick = useCallback(() => {
    setOpened(prev => !prev)
  }, [])

  const data = useMemo(() => [], [])

  return (
    <Autocomplete
      ref={ref}
      aria-label="Search"
      classNames={classNames}
      data={data}
      icon={icon}
      onClick={handleClick}
    />
  )
}
