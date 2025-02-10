// components/NotFoundPage.js

import { useLayoutEffect, useState } from 'react'
import { Content } from '@prismicio/client'
import { PrismicRichText, SliceZone } from '@prismicio/react'
import { GetStaticProps } from 'next'

import { components } from '@/components/slices'
import { createClient } from '@/prismic-io'
import { Link } from 'react-daisyui'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { LoadingOverlay } from '@mantine/core'

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
    const client = createClient({ previewData })
    const data = await client.getSingle<Content.NotFoundMessageDocument>(
        'not_found_message'
    )

    return {
        props: {
            data,
        },
    }
}
const NotFoundPage = ({ data: { data } }: { data: Content.NotFoundMessageDocument }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [show404, setShow404] = useState(false)
  const eventShare = pathname.split('/')
  const u = router.asPath?.split('?u=')
  const consultantPathRegex = /^\/consultants\/.*$/
  const isEeventShare = eventShare?.[1] === 'eventshare'
  useLayoutEffect(() => {
    if (['/my-account/profile', '/my-account/orders'].includes(pathname)) {
      router.push(router.asPath)
    } else if (consultantPathRegex.test(router.asPath)) {
      router.push(router.asPath)
    } else if (isEeventShare) {
      router.push(`/?u=${u[1]}&eventshare=${eventShare?.[2]}`)
    }

    setTimeout(() => {
      setShow404(true)
    }, 7500)
  }, [])

  // Check if the route is '/restricted-route' to show a specific message
  if (!(['/my-account/profile', '/my-account/orders', 'u='].includes(pathname) || isEeventShare)) {
    return (
      <div className="container mx-auto">
        {show404 ? <main>
                <div className="container mx-auto mb-10">
                    <div className="w-50 mx-auto pt-5 text-center">
                        <PrismicRichText fallback={<></>} field={data?.subtitle} />
                    </div>
                    <SliceZone components={components} slices={data?.body} />
                    {/* <h1>{data?.footer_text?.[0]}</h1> */}
                    <div className="pb-5 text-center">
                        <PrismicRichText fallback={<></>} field={data?.footer_text} />
                        <Link
                            className="mt-6 text-base font-semibold leading-normal !text-neutral-900 justify-center underline"
                            href={data?.button_link?.[0]?.text || ''}
                        >
                            {data?.button_text?.[0]?.text}
                        </Link>

                    </div>
                </div>
            </main > : <LoadingOverlay visible={true} />}
      </div>
    )
  }
  // Default content for the not found page
  return <LoadingOverlay visible={true} />
}

export default NotFoundPage
