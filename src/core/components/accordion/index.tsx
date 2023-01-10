import { KeyboardEvent, ReactNode, useId, useState } from 'react'

import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'

interface AccordionProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  header: string
  openByDefault?: boolean
}

export const Accordion = ({
  children,
  className,
  disabled = false,
  header,
  openByDefault = false,
}: AccordionProps) => {
  const [open, setOpen] = useState(openByDefault)
  const headerId = useId()
  const bodyId = useId()

  const handleOpen = () => {
    if (!disabled) {
      setOpen(prev => !prev)
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Space') {
      handleOpen()
    }
  }

  return (
    <div className={clsx('w-full', className)}>
      <div
        aria-controls={bodyId}
        aria-expanded={open}
        className={clsx(
          `
            flex cursor-pointer items-center justify-between border-b-2
            border-neutral-100 py-3 font-semibold capitalize
          `,
          disabled && 'cursor-not-allowed text-neutral-300'
        )}
        id={headerId}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={onKeyDown}
      >
        {header}
        <ChevronDownIcon
          className={clsx('transition-transform duration-200', open && 'rotate-180')}
          height={24}
          width={24}
        />
      </div>
      <div
        aria-labelledby={headerId}
        className={clsx(
          'h-0 overflow-hidden transition-all',
          open && '!h-max overflow-visible py-3'
        )}
        id={bodyId}
        role="region"
      >
        {children}
      </div>
    </div>
  )
}
