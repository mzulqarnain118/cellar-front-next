import { FocusEventHandler, FormEventHandler, useCallback, useMemo } from 'react'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@mantine/core'
import { clsx } from 'clsx'

import { useFiltersStore } from '@/lib/stores/filters'

interface SearchProps {
  className?: string
  id: string
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

const classNames = {
  input: 'xl:transition-all xl:w-56 xl:focus:w-96',
}

export const Search = ({ className, id, onBlur, onFocus }: SearchProps) => {
  const router = useRouter()
  const { searchValue, setSearchValue } = useFiltersStore()
  const pathname = usePathname();

  const handleSearch: FormEventHandler = useCallback(event => {
    event.preventDefault()
    router.push(`/search?q=${searchValue}`)
    pathname !== '/search' && localStorage.setItem('searchedPage', pathname)
  }, [searchValue])
  const rightSection = useMemo(
    () => (
      <button
        aria-label="Search"
        className="cursor-pointer border-0 text-neutral-900"
        type="submit"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
      </button>
    ),
    []
  )

  return (
    <div className={clsx('px-4 pb-2', className)}>
      <form onSubmit={handleSearch}>
        <Input
          aria-label="Search"
          classNames={classNames}
          id={id}
          placeholder="What can we help you find?"
          rightSection={rightSection}
          type="search"
          value={searchValue}
          onBlur={onBlur}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={onFocus}
        />
      </form>
    </div>
  )
}
