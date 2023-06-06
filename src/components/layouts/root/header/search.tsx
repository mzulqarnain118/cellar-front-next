import { FormEventHandler, useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Autocomplete, AutocompleteItem, AutocompleteProps, Loader } from '@mantine/core'
import { useClickOutside, useDebouncedValue } from '@mantine/hooks'
import { clsx } from 'clsx'

import { Button } from '@/core/components/button'
import { useSearchQuery } from '@/features/search/queries'
import { ProductsSchema } from '@/lib/types/schemas/product'

import { SearchItem } from './search-item'

const icon = <MagnifyingGlassIcon className="h-5 w-5 stroke-[3] text-black" />

export const SearchNew = () => {
  const [opened, setOpened] = useState(true)

  const close = useCallback(() => {
    // setOpened(false)
  }, [])
  const ref = useClickOutside(close)
  const [value, setValue] = useState('')
  const [debouncedSearchValue] = useDebouncedValue(value, 250)
  const searchProps = useMemo(
    () => ({
      search: debouncedSearchValue,
    }),
    [debouncedSearchValue]
  )
  const {
    data: searchResults,
    isFetching: isFetching,
    isLoading: isSearching,
  } = useSearchQuery(searchProps)
  const router = useRouter()

  const classNames: AutocompleteProps['classNames'] = useMemo(
    () => ({
      dropdown: '',
      input: clsx(
        'transition-all',
        opened ? 'w-[18.75rem]' : 'p-0 w-0 bg-[#f5f3f2] border-0 cursor-pointer'
      ),
    }),
    [opened]
  )

  const handleClick = useCallback(() => {
    setOpened(prev => !prev)
  }, [])

  const buildOptions = (result: ProductsSchema) => ({
    ...result,
    label: result.displayName.toLowerCase(),
    value: result.cartUrl,
  })

  const rightSection = useMemo(
    () => ((isFetching || isSearching) && opened ? <Loader size="sm" /> : undefined),
    [isFetching, isSearching, opened]
  )

  const handleItemSubmit: AutocompleteProps['onItemSubmit'] = useCallback(
    (item: AutocompleteItem) => {
      router.push(`/product/${item.value}`)
    },
    [router]
  )

  const filter = useCallback(() => true, [])
  const data = useMemo(
    () => (!!searchResults && searchResults?.map(buildOptions)) || [],
    [searchResults]
  )

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    event => {
      event.preventDefault()
      router.push(`/search?q=${value}`)
    },
    [router, value]
  )

  return (
    <form className="flex relative" onSubmit={onSubmit}>
      <Autocomplete
        ref={ref}
        aria-label="Search"
        classNames={classNames}
        data={data}
        filter={filter}
        icon={icon}
        itemComponent={SearchItem}
        nothingFound="not found"
        rightSection={rightSection}
        value={value}
        onChange={setValue}
        // onClick={handleClick}
        onItemSubmit={handleItemSubmit}
      />
      <Button dark className="hidden absolute right-2 top-1.5" size="xs" type="submit">
        Search
      </Button>
    </form>
  )
}
