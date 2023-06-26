import { useMemo, useRef } from 'react'

import { PrinterIcon } from '@heroicons/react/24/outline'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { InferGetStaticPropsType, NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { IReactToPrintProps, useReactToPrint } from 'react-to-print'

import { Button } from '@/core/components/button'
import { WinelistHeader } from '@/features/winelist/components/header'
import { WinelistTable } from '@/features/winelist/components/table'
import { PRODUCTS_QUERY_KEY, getAllProducts } from '@/lib/queries/products'

export const getStaticProps = async () => {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery([...PRODUCTS_QUERY_KEY], getAllProducts)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

const printerIcon = <PrinterIcon className="h-4 w-4" />

type PageProps = InferGetStaticPropsType<typeof getStaticProps>

const WinelistPage: NextPage<PageProps> = () => {
  const componentRef = useRef<HTMLDivElement | null>(null)
  const printProps: IReactToPrintProps = useMemo(
    () => ({
      content: () => componentRef.current,
    }),
    []
  )
  const handlePrint = useReactToPrint(printProps)

  return (
    <>
      <NextSeo
        description="A complete list of all of our wines currently available."
        title="Winelist"
      />
      <main className="bg-neutral-50">
        <div className="container mx-auto my-10">
          <div className="inline-flex mb-4 items-center justify-end w-full">
            <Button dark startIcon={printerIcon} onClick={handlePrint}>
              Print this out!
            </Button>
          </div>
          <div ref={componentRef}>
            <WinelistHeader />
            <WinelistTable />
          </div>
        </div>
      </main>
    </>
  )
}

export default WinelistPage
