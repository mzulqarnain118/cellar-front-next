import { useCallback, useEffect, useState } from 'react'

export const useScrollDirection = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)

  const handleScroll = useCallback(() => {
    const div = document.querySelector('#root-element')
    const currentScrollPos = div?.scrollTop || 0

    if (currentScrollPos > prevScrollPos) {
      setVisible(false)
    } else {
      setVisible(true)
    }

    setPrevScrollPos(currentScrollPos)
  }, [prevScrollPos])

  useEffect(() => {
    const div = document.querySelector('#root-element')
    div?.addEventListener('scroll', handleScroll)

    return () => div?.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return {
    direction: visible ? 'up' : 'down',
    scrollTop:
      typeof window !== 'undefined' ? document.querySelector('#root-element')?.scrollTop || 0 : 0,
  }
}
