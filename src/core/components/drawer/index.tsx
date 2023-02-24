import { ElementType, KeyboardEventHandler, ReactNode } from 'react'

interface DrawerProps {
  as?: ElementType
  className?: string
  children: ReactNode
  direction?: 'left' | 'right'
  id: string
  open: boolean
  setOpen: (open: boolean) => void
  title?: string
  trigger: JSX.Element
}

export const Drawer = ({
  // as = 'div',
  // children,
  className,
  // direction = 'left',
  // id,
  // open,
  setOpen,
  // title,
  trigger,
}: DrawerProps) => {
  // const [isMounted, setIsMounted] = useState(false)
  // const Component = as

  // const createDrawerElement = () => {
  //   const newDrawer = document.createElement('div')
  //   newDrawer.setAttribute('id', id)
  //   document.body.appendChild(newDrawer)
  //   return newDrawer
  // }

  // const handleBackdropClick = () => {
  //   if (setOpen) {
  //     setOpen(false)
  //   }
  //   document.querySelector('body')?.classList.remove('overflow-hidden')
  // }

  const handleDrawerOpen = () => {
    if (setOpen) {
      setOpen(true)
    }
    document.querySelector('body')?.classList.add('overflow-hidden')
  }

  // const keyDownHandler = (event: KeyboardEvent) => {
  //   if (event.key === 'Escape') {
  //     handleBackdropClick()
  //   }
  // }

  const handleEnterKey: KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.key === 'Enter') {
      handleDrawerOpen()
    }
  }

  // const handleBackdropEnterKey: KeyboardEventHandler<HTMLDivElement> = event => {
  //   if (event.key === 'Enter') {
  //     handleBackdropClick()
  //   }
  // }

  // useEffect(() => {
  //   document.addEventListener('keydown', keyDownHandler)

  //   if (open) {
  //     document.querySelector('body')?.classList.add('overflow-hidden')
  //   }

  //   setIsMounted(true)

  //   return () => {
  //     document.removeEventListener('keydown', keyDownHandler)
  //     setIsMounted(false)
  //     if (setOpen) {
  //       setOpen(false)
  //     }
  //     document.querySelector('body')?.classList.remove('overflow-hidden')
  //     document.querySelector(`div#${id}`)?.remove()
  //   }
  // }, [])

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
      {/* {isMounted
        ? createPortal(
            <>
              <div
                aria-label="Close menu"
                className={clsx(
                  `
                    fixed top-0 left-0 bottom-0 right-0 z-20 h-full w-full -translate-x-full
                    bg-neutral-900 opacity-0 transition-opacity
                  `,
                  open && 'translate-x-0 !opacity-70'
                )}
                role="button"
                tabIndex={0}
                onClick={handleBackdropClick}
                onKeyDown={handleBackdropEnterKey}
              />
              <div
                className={clsx(
                  `
                    fixed top-0 left-0 z-20 h-screen -translate-x-full bg-neutral-50
                    transition-transform
                  `,
                  direction === 'right' && 'right-0 left-auto translate-x-full',
                  open && (direction === 'left' ? 'translate-x-0' : '-translate-x-0')
                )}
              >
                <Component aria-label="Drawer content" className="flex h-screen flex-col">
                  <div
                    className={clsx(
                      'mt-4 flex',
                      title !== undefined &&
                        'items-center border-b-2 border-b-neutral-100 pl-4 pb-4'
                    )}
                  >
                    {title !== undefined && (
                      <span className="w-full justify-self-center text-center font-heading text-2xl font-bold">
                        {title}
                      </span>
                    )}
                    <button
                      aria-label="Close menu"
                      className="group mr-4 justify-self-end rounded-lg p-1 transition-colors hover:bg-neutral-200"
                      type="button"
                      onClick={() => setOpen(false)}
                    >
                      <XMarkIcon className="hover:text-error h-6 w-6 stroke-1 text-neutral-500 transition-colors group-hover:text-neutral-800" />
                    </button>
                  </div>
                  {children}
                </Component>
              </div>
            </>,
            document.querySelector(`#${id}`) || createDrawerElement()
          )
        : undefined} */}
    </div>
  )
}
