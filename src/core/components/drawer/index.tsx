import { ElementType, KeyboardEventHandler, ReactNode, useEffect, useState } from 'react'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'
import { createPortal } from 'react-dom'

interface DrawerProps {
  as?: ElementType
  className?: string
  children: ReactNode
  id: string
  trigger: JSX.Element
}

export const Drawer = ({ as = 'div', children, className, id, trigger }: DrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const Component = as

  const handleBackdropClick = () => {
    setIsOpen(false)
    document.querySelector('body')?.classList.remove('overflow-hidden')
  }
  const handleDrawerOpen = () => {
    setIsOpen(true)
    document.querySelector('body')?.classList.add('overflow-hidden')
  }
  const keyDownHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleBackdropClick()
    }
  }
  const handleEnterKey: KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.key === 'Enter') {
      handleDrawerOpen()
    }
  }
  const handleBackdropEnterKey: KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.key === 'Enter') {
      handleBackdropClick()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler)
    setIsMounted(true)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      setIsMounted(false)
      document.querySelector('body')?.classList.remove('overflow-hidden')
    }
  }, [])

  return (
    <div className={className}>
      <div
        aria-label="Open menu"
        role="button"
        tabIndex={0}
        onClick={handleDrawerOpen}
        onKeyDown={handleEnterKey}
      >
        {trigger}
      </div>
      {isMounted
        ? createPortal(
            <>
              <div
                aria-label="Close menu"
                className={clsx(
                  `
                    absolute top-0 left-0 h-screen w-full -translate-x-full bg-neutral-900
                    opacity-0 transition-opacity
                  `,
                  isOpen && 'translate-x-0 !opacity-70'
                )}
                role="button"
                tabIndex={0}
                onClick={handleBackdropClick}
                onKeyDown={handleBackdropEnterKey}
              />
              <div
                className={clsx(
                  `
                    absolute top-0 left-0 z-10 h-screen -translate-x-full bg-neutral-50
                    transition-transform
                  `,
                  isOpen && 'translate-x-0'
                )}
              >
                <Component className="flex h-screen flex-col p-4">
                  <div className="inline-flex justify-end">
                    <button aria-label="Close menu" type="button" onClick={() => setIsOpen(false)}>
                      <XMarkIcon
                        className={`
                          h-6 w-6 stroke-1 text-neutral-500 transition-colors hover:text-error
                        `}
                      />
                    </button>
                  </div>
                  {children}
                </Component>
              </div>
            </>,
            document.querySelector(`#${id}`) as HTMLElement
          )
        : undefined}
    </div>
  )
}
