import { FocusEventHandler, useState } from 'react'

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'

interface SearchProps {
  className?: string
  id: string
  onBlur?: FocusEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
}

export const Search = ({ className, id, onBlur, onFocus }: SearchProps) => {
  const [isButtonFocused, setIsButtonFocused] = useState(false)

  return (
    <div className={clsx('flex h-10 w-full', className)}>
      <form className="inline-flex w-full">
        <label className="invisible h-0 w-0" htmlFor="search">
          Search
        </label>
        <input
          className={`
            h-10 w-full rounded-bl-lg rounded-tl-lg border border-neutral-300 bg-neutral-100 px-3
            transition-all duration-75 placeholder:text-neutral-500 focus:!outline focus:outline-1
            focus:outline-offset-0 focus:outline-brand
          `}
          id={id}
          placeholder="What can we help you find?"
          type="search"
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <button
          aria-label="Search"
          className={clsx(
            `max-w-10 btn-primary inline-flex h-10 w-10 items-center justify-center rounded-br-lg
            rounded-tr-lg transition-all hover:w-14`,
            isButtonFocused && 'w-14'
          )}
          type="submit"
          onBlur={() => setIsButtonFocused(false)}
          onFocus={() => setIsButtonFocused(true)}
        >
          <MagnifyingGlassIcon className="h-5 w-5" id={`${id}-search-icon`} />
        </button>
      </form>
    </div>
  )
}
