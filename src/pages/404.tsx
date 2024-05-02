// components/NotFoundPage.js

import { useLayoutEffect, useState } from 'react'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { LoadingOverlay } from '@mantine/core'

const NotFoundPage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [show404, setShow404] = useState(false)
  const eventShare = pathname.split('/')
  const u = router.asPath?.split('?u=')
  const isEeventShare = eventShare?.[1] === 'eventshare'
  useLayoutEffect(() => {
    if (['/my-account/profile', '/my-account/orders'].includes(pathname)) {
      router.push(router.asPath)
    } else if (isEeventShare) {
      router.push(`/?u=${u[1]}&eventshare=${eventShare?.[2]}`)
    }

    setTimeout(() => {
      setShow404(true)
    }, 5000)
  }, [])

  // Check if the route is '/restricted-route' to show a specific message
  if (!(['/my-account/profile', '/my-account/orders', 'u='].includes(pathname) || isEeventShare)) {
    return (
      <div className="container mx-auto">
        {show404 ? <h1>Page Not Found</h1> : <LoadingOverlay visible={true} />}
      </div>
    )
  }
  // Default content for the not found page
  return <LoadingOverlay visible={true} />
}

export default NotFoundPage
