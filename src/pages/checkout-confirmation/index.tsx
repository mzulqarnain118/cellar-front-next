import { NextPage } from 'next'
// eslint-disable-next-line import/order
import { NextSeo } from 'next-seo'
// eslint-disable-next-line import/order
import { useReceiptData } from '@/lib/stores/receipt'

const CheckoutConfirmationPage: NextPage = () => {
  const data = useReceiptData()
  console.log('data', data)
  return (
    <>
      <NextSeo />
    </>
  )
}

export default CheckoutConfirmationPage
