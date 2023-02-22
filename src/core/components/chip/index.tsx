import { KeyboardEvent } from 'react'

interface ChipProps {
  className?: string
  name: string
  onClick?: (name: string) => void
}

export const Chip = ({ className, name, onClick }: ChipProps) => {
  const handleOnClick = () => {
    if (onClick) {
      onClick(name)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault()
    if (event.key === 'Backspace') {
      handleOnClick()
    }
  }

  return (
    <div
      aria-checked="true"
      aria-disabled="false"
      aria-selected="true"
      className={className}
      role="option"
      tabIndex={0}
      onClick={handleOnClick}
      onKeyDown={handleKeyDown}
    >
      <span
        className={`
          align-center ease group flex w-max cursor-pointer rounded-full bg-neutral-200
          px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-300 hover:text-neutral-700 active:bg-neutral-300
        `}
      >
        {name}
        <button className="hover bg-transparent focus:outline-none" onClick={handleOnClick}>
          <svg
            aria-hidden="true"
            className="ml-3 w-3"
            focusable="false"
            role="img"
            viewBox="0 0 352 512"
          >
            <path
              d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
      </span>
    </div>
  )
}
