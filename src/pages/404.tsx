// components/NotFoundPage.js

import { Content } from '@prismicio/client'
import { SliceZone } from '@prismicio/react'
import { useLayoutEffect, useState } from 'react'

import { components } from '@/components/slices'
import { createClient } from '@/prismic-io'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'

import { HOME_PAGE_PATH } from '@/lib/paths'
import { LoadingOverlay } from '@mantine/core'
import { asText } from '@prismicio/client'
import { GetStaticPropsContext } from 'next'
import { NextSeo } from 'next-seo'
import { pathToBeIgnored } from '@/lib/constants'

export const getStaticProps = async ({ previewData }: GetStaticPropsContext) => {
    const client = createClient({ previewData })
    let page
    try {
        page = await client.getByUID<Content.RichContentPageDocument>(
            'rich_content_page',
            'page-not-found'
        )
    } catch (error) {
        return {
            redirect: {
                destination: `${HOME_PAGE_PATH}`,
                permanent: false,
            },
        }
    }
    return {
        props: {
            page: page || null,
        },
    }
}

const NotFoundPage = ({
    page,
}: {
    page?: Content.RichContentPageDocument | Content.ContentPageDocument | null
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const [show404, setShow404] = useState(false)
    const eventShare = pathname.split('/')
    const u = router.asPath?.split('?u=')
    const consultantPathRegex = /^\/consultants\/.*$/
    const isEeventShare = eventShare?.[1] === 'eventshare'
    useLayoutEffect(() => {
        if (pathToBeIgnored.includes(pathname)) {
            router.push(router.asPath)
        } else if (consultantPathRegex.test(router.asPath)) {
            router.push(router.asPath)
        } else if (isEeventShare) {
            router.push(`/?u=${u[1]}&eventshare=${eventShare?.[2]}`)
        }

        setTimeout(() => {
          setShow404(true)
        }, 1500)
    }, [])

    // Check if the route is '/restricted-route' to show a specific message.
    if (!(pathToBeIgnored.includes(pathname) || isEeventShare)) {
        return (
            <div className="container mx-auto">
                {/* show prismic 404 page */}
                {page?.type === 'rich_content_page' &&  show404 &&(
                    <>
                        <NextSeo
                            description={asText(page?.data.meta_description) || undefined}
                            title={asText(page?.data.meta_title) || undefined}
                        />
                        <main>
                            <SliceZone components={components} slices={page?.data.body} />
                        </main>
                    </>
                )}
            </div>
        )
    }
    // Default content for the not found page
    return <LoadingOverlay visible={true} />
}

export default NotFoundPage
