import { NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { Typography } from '@/core/components/typogrpahy'

const ForgotPasswordPage: NextPage = () => (
  <>
    <NextSeo />
    <main>
      <Typography as="h1">Forgot Password</Typography>
    </main>
  </>
)

export default ForgotPasswordPage
