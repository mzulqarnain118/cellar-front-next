import { NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { useReceiptData } from '@/lib/stores/receipt'

const CheckoutConfirmationPage: NextPage = () => {
  const _data = useReceiptData()

  return (
    <>
      <NextSeo />
    </>
  )
}

export default CheckoutConfirmationPage
