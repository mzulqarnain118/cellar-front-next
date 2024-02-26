const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: 'i.ytimg.com',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'images.prismic.io',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'scoutandcellar.blob.core.windows.net',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: 'storage.googleapis.com',
        pathname: '**',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: '/my-account/profile',
      permanent: true,
      source: '/my-account',
    },
    {
      source: '/become-consultant',
      destination: 'https://join.scoutandcellar.com/',
      permanent: true,
    },
    {
      source: '/log-in',
      destination: '/sign-in',
      permanent: true,
    },
    {
      source: '/login',
      destination: '/sign-in',
      permanent: true,
    },
    {
      source: '/signup',
      destination: '/create-account',
      permanent: true,
    },
    {
      source: '/unrealholiday',
      destination: '/product/holidaygiftset-unrealholiday-22q4-unrealhol',
      permanent: true,
    },
    {
      source: '/merch/category/giftcards',
      destination: '/product/e-giftcard',
      permanent: true,
    },
    {
      source: '/giftcards',
      destination: '/product/e-giftcard',
      permanent: true,
    },
    {
      source: '/coffee',
      destination: '/brands/scouting-grounds',
      permanent: true,
    },
    {
      source: '/wine/category/circle',
      destination: '/circle',
      permanent: true,
    },
    {
      source: '/product/4bottleclub30',
      destination: '/product/scoutcircle-4bottle-mix-30',
      permanent: true,
    },
    {
      source: '/product/b4bottleclub30',
      destination: '/product/scoutcircle-4bottle-mix-30-b',
      permanent: true,
    },
    {
      source: '/product/4bottleclub130',
      destination: '/product/scoutcircle-4bottle-mix-130',
      permanent: true,
    },
    {
      source: '/product/b4bottleclub130',
      destination: '/product/scoutcircle-4bottle-mix-130-b',
      permanent: true,
    },
    {
      source: '/product/6whiteclubparty30',
      destination: '/product/scoutcircle-6bottle-white-30',
      permanent: true,
    },
    {
      source: '/product/b6whiteclubparty30',
      destination: '/product/scoutcircle-6bottle-white-30-b',
      permanent: true,
    },
    {
      source: '/product/6whiteclubparty130',
      destination: '/product/scoutcircle-6bottle-white-130',
      permanent: true,
    },
    {
      source: '/product/b6whiteclubparty130',
      destination: '/product/scoutcircle-6bottle-white-130-b',
      permanent: true,
    },
    {
      source: '/product/6redclubparty30',
      destination: '/product/scoutcircle-6bottle-red-30',
      permanent: true,
    },
    {
      source: '/product/b6redclubparty30',
      destination: '/product/scoutcircle-6bottle-red-30-b',
      permanent: true,
    },
    {
      source: '/product/6redclubparty130',
      destination: '/product/scoutcircle-6bottle-red-130',
      permanent: true,
    },
    {
      source: '/product/b6redclubparty130',
      destination: '/product/scoutcircle-6bottle-red-130-b',
      permanent: true,
    },
    {
      source: '/product/6mixedclubparty30',
      destination: '/product/scoutcircle-6bottle-mix-30',
      permanent: true,
    },
    {
      source: '/product/b6mixedclubparty30',
      destination: '/product/scoutcircle-6bottle-mix-30-b',
      permanent: true,
    },
    {
      source: '/product/6mixedclubparty130',
      destination: '/product/scoutcircle-6bottle-mix-130',
      permanent: true,
    },
    {
      source: '/product/b6mixedclubparty130',
      destination: '/product/scoutcircle-6bottle-mix-130-b',
      permanent: true,
    },
    {
      source: '/product/12mixedclubparty30',
      destination: '/product/scoutcircle-12bottle-red-30',
      permanent: true,
    },
    {
      source: '/product/b12redclubparty30',
      destination: '/product/scoutcircle-12bottle-red-30-b',
      permanent: true,
    },
    {
      source: '/product/12redclubparty130',
      destination: '/product/scoutcircle-12bottle-red-130',
      permanent: true,
    },
    {
      source: '/product/b12redclubparty130',
      destination: '/product/scoutcircle-12bottle-red-130-b',
      permanent: true,
    },
    {
      source: '/product/12redclubparty30',
      destination: '/product/scoutcircle-12bottle-mix-30',
      permanent: true,
    },
    {
      source: '/product/b12mixedclubparty30',
      destination: '/product/scoutcircle-12bottle-mix-30-b',
      permanent: true,
    },
    {
      source: '/product/12redclubparty130',
      destination: '/product/scoutcircle-12bottle-mix-130',
      permanent: true,
    },
    {
      source: '/product/b12mixedclubparty130',
      destination: '/product/scoutcircle-12bottle-mix-130-b',
      permanent: true,
    },
  ],
  sentry: {
    hideSourceMaps: true,
  },
  eslint: {
    // Ignore ESLint during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript type errors during the build process
    ignoreBuildErrors: true,
  },
}

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'scout-cellar',
  project: 'dot-com',
  // Suppresses source map uploading logs during build
  silent: true,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions, {
  trailingSlash: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,
  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
})
