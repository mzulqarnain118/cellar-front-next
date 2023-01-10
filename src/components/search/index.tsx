import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'

interface SearchProps {
  className?: string
  id: string
}

export const Search = ({ className, id }: SearchProps) => (
  <div className={clsx('flex h-10 w-full', className)}>
    <label className="invisible h-0 w-0" htmlFor="search">
      Search
    </label>
    <input
      className={`
        w-full rounded-bl-lg rounded-tl-lg bg-input px-3 py-2 text-neutral-500
        shadow-inner transition-[outline] placeholder:text-neutral-300 focus:border-none
        focus:transition-[outline]
      `}
      id={id}
      placeholder="Search"
      type="search"
    />
    <button
      aria-label="Search"
      className={`
        max-w-10 inline-flex h-10 w-10 items-center justify-center rounded-br-lg rounded-tr-lg
        bg-primary-400 px-[0.625rem] text-primary-100 duration-300 hover:w-14
        hover:bg-primary-500
      `}
      type="submit"
    >
      <MagnifyingGlassIcon className="h-5 w-5" id="searchIcon" />
    </button>
  </div>
)
