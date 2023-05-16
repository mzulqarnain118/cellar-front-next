import { NextPage } from 'next'
import { NextSeo } from 'next-seo'

import { Typography } from '@/core/components/typogrpahy'

const ForgotPasswordPage: NextPage = () => (
  <>
    <NextSeo />
    <Typography as="h1">Forgot Password</Typography>
  </>
)

export default ForgotPasswordPage
