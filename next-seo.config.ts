import { DefaultSeoProps } from 'next-seo'

const defaultSEOConfig: DefaultSeoProps = {
  defaultTitle: 'Scout & Cellar | Clean-Crafted Commitment',
  openGraph: {
    locale: 'en_US',
    siteName: 'Scout & Cellar',
    type: 'website',
    url: 'https://www.scoutandcellar.com/',
  },
  titleTemplate: '%s | Scout & Cellar | Clean-Crafted Commitment',
}

export default defaultSEOConfig
