import { DefaultSeoProps } from 'next-seo'

const defaultSEOConfig: DefaultSeoProps = {
  defaultTitle: 'Scout & Cellar - Discover the Difference of Clean-Crafted™',
  description: `
    We create an authentic, sustainable, and delicious approach to winemaking. Our wine is free of
    toxic pesticides, artificial processing aids, and added sugar.
  `,
  openGraph: {
    locale: 'en_US',
    siteName: 'Scout & Cellar',
    type: 'website',
    url: 'https://www.scoutandcellar.com/',
  },
  titleTemplate: '%s - Scout & Cellar',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@scoutandcellar',
    site: '@scoutandcellar',
  },
}

export default defaultSEOConfig
