import { DefaultSeoProps } from 'next-seo'

const defaultSEOConfig: DefaultSeoProps = {
  defaultTitle: 'Scout & Cellar | Wine | Coffee | Cooking Products',
  description: `
  Everything that leaves our doors is created to taste great, to do better for our planet, and to improve the way we live. Live for Today. Care for Tomorrow ™.
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
