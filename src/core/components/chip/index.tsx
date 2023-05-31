import { useCallback } from 'react'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { Chip as MantineChip } from '@mantine/core'

const chipClassNames = {
  label: `
    flex items-center gap-1 bg-neutral-dark text-neutral-50 px-4 transition-all
    hover:bg-neutral-light hover:text-neutral-dark capitalize
  `,
}

interface ChipProps {
  className?: string
  name: string
  onClick?: (name: string) => void
}

export const Chip = ({ className, name, onClick }: ChipProps) => {
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(name)
    }
  }, [name, onClick])

  return (
    <MantineChip className={className} classNames={chipClassNames} onClick={handleOnClick}>
      <XMarkIcon className="w-4 h-4" />
      {name.replaceAll('-', ' ')}
    </MantineChip>
  )
}
