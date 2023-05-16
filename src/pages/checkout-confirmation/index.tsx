import { NextPage } from 'next'
// eslint-disable-next-line import/order
import { NextSeo } from 'next-seo'
// eslint-disable-next-line import/order
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
