import { NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { useReceiptData } from '@/lib/stores/receipt'

const CheckoutConfirmationPage: NextPage = () => {
  const _data = useReceiptData()

  return (
    <>
      <NextSeo />
      <main></main>
    </>
  )
}

export default CheckoutConfirmationPage
