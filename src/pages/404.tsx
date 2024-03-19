// components/NotFoundPage.js

import { useLayoutEffect } from 'react'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { LoadingOverlay } from '@mantine/core'

const NotFoundPage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const eventShare = pathname.split('/')
  const u = router.asPath?.split('?u=')
  const isEeventShare = eventShare?.[1] === 'eventshare'
  useLayoutEffect(() => {
    if (['/my-account/profile', 'my-account/orders'].includes(router.asPath)) {
      router.push(router.asPath)
    } else if (isEeventShare) {
      router.push(`/?u=${u[1]}&eventshare=${eventShare?.[2]}`)
    }
  }, [])

  // Check if the route is '/restricted-route' to show a specific message
  if (!(['/my-account/profile', 'my-account/orders'].includes(router.asPath) || isEeventShare)) {
    return (
      <div className="container mx-auto">
        <h1>Page Not Found</h1>
      </div>
    )
  }
  // Default content for the not found page
  return <LoadingOverlay visible={true} />
}

export default NotFoundPage
